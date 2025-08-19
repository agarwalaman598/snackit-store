import {
  users, categories, products, orders, orderItems,
  type User, type UpsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type ProductWithCategory,
  type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, inArray } from "drizzle-orm";

export class DatabaseStorage {
  // USER METHODS
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.email,
      set: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      },
    }).returning();
    return user;
  }

  // CATEGORY METHODS
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  // PRODUCT METHODS
  async getProducts(): Promise<ProductWithCategory[]> {
    const result = await db.select().from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isActive, true))
      .orderBy(asc(products.name));
    return result.map(row => ({ ...row.products, category: row.categories! }));
  }
  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const [result] = await db.select().from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));
    if (!result) return undefined;
    return { ...result.products, category: result.categories! };
  }
  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }
  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set({ ...updates, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return product;
  }

  // ORDER METHODS
  async getOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.query.orders.findMany({
      with: {
        user: true,
        orderItems: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
    });

    return allOrders.map(order => ({
      ...order,
      status: order.orderStatus,
    }));
  }

  async createOrder(orderData: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    const orderItemsData = items.map(item => ({ ...item, orderId: order.id }));
    await db.insert(orderItems).values(orderItemsData);
    for (const item of items) {
      await db.update(products).set({ stock: sql`${products.stock} - ${item.quantity}` }).where(eq(products.id, item.productId));
    }
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ orderStatus: status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return order;
  }
}

export const storage = new DatabaseStorage();