import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  decimal,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  icon: varchar("icon").notNull(),
  slug: varchar("slug").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(), // 'cash' or 'upi'
  paymentStatus: varchar("payment_status").notNull().default('pending'), // 'pending', 'completed', 'failed'
  deliveryAddress: jsonb("delivery_address").notNull(),
  orderStatus: varchar("order_status").notNull().default('placed'), // 'placed', 'preparing', 'delivered', 'cancelled'
  phoneNumber: varchar("phone_number").notNull(),
  hostelBlock: varchar("hostel_block").notNull(),
  roomNumber: varchar("room_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(), // <-- FIX
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // <-- FIX
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// ... (rest of the file remains the same)
// Relations
export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),
  }));
  
  export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
  }));
  
  export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
      fields: [products.categoryId],
      references: [categories.id],
    }),
    orderItems: many(orderItems),
  }));
  
  export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
      fields: [orders.userId],
      references: [users.id],
    }),
    orderItems: many(orderItems),
  }));
  
  export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
    }),
    product: one(products, {
      fields: [orderItems.productId],
      references: [products.id],
    }),
  }));
  
  // Insert schemas
  export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });
  
  export const insertCategorySchema = createInsertSchema(categories).omit({
    id: true,
    createdAt: true,
  });
  
  export const insertProductSchema = createInsertSchema(products).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });
  
  export const insertOrderSchema = createInsertSchema(orders).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });
  
  export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
    id: true,
  });
  
  // Types
  export type User = typeof users.$inferSelect;
  export type UpsertUser = z.infer<typeof insertUserSchema>;
  export type Category = typeof categories.$inferSelect;
  export type InsertCategory = z.infer<typeof insertCategorySchema>;
  export type Product = typeof products.$inferSelect;
  export type InsertProduct = z.infer<typeof insertProductSchema>;
  export type Order = typeof orders.$inferSelect;
  export type InsertOrder = z.infer<typeof insertOrderSchema>;
  export type OrderItem = typeof orderItems.$inferSelect;
  export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
  
  // Extended types with relations
  export type ProductWithCategory = Product & { category: Category };
  export type OrderWithItems = Order & { 
    orderItems: (OrderItem & { product: Product })[];
    user: User;
    status: string; // alias for orderStatus for backward compatibility
  };