import {
  users, categories, products, orders, orderItems,
  type User, type UpsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type ProductWithCategory,
  type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, inArray } from "drizzle-orm";

// ... (interface remains the same)
export interface IStorage {
    // User operations
    getUser(id: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    upsertUser(user: UpsertUser): Promise<User>;
    
    // Category operations
    getCategories(): Promise<Category[]>;
    createCategory(category: InsertCategory): Promise<Category>;
    updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined>;
    deleteCategory(id: string): Promise<boolean>;
    
    // Product operations
    getProducts(): Promise<ProductWithCategory[]>;
    getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]>;
    getProduct(id: string): Promise<ProductWithCategory | undefined>;
    createProduct(product: InsertProduct): Promise<Product>;
    updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
    updateProductStock(id: string, stock: number): Promise<Product | undefined>;
    deleteProduct(id: string): Promise<boolean>;
    
    // Order operations
    getOrders(): Promise<OrderWithItems[]>;
    getUserOrders(userId: string): Promise<OrderWithItems[]>;
    getOrder(id: string): Promise<OrderWithItems | undefined>;
    createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
    updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
    updatePaymentStatus(id: string, status: string): Promise<Order | undefined>;
  }

export class DatabaseStorage implements IStorage {
  // ... (user, category, and product methods remain the same)
   // User operations
   async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Product operations
  async getProducts(): Promise<ProductWithCategory[]> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isActive, true))
      .orderBy(asc(products.name));
    
    return result.map(row => ({
      ...row.products,
      category: row.categories!
    }));
  }

  async getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
      .orderBy(asc(products.name));
    
    return result.map(row => ({
      ...row.products,
      category: row.categories!
    }));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const [result] = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.products,
      category: result.categories!
    };
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async updateProductStock(id: string, stock: number): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ stock, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // CORRECTED getOrders function
  async getOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    if (allOrders.length === 0) return [];

    const orderIds = allOrders.map(o => o.id);
    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));

    const userIds = allOrders.map(o => o.userId);
    const orderUsers = await db.select().from(users).where(inArray(users.id, userIds));
    const usersMap = new Map(orderUsers.map(u => [u.id, u]));

    const itemsMap = new Map<string, (OrderItem & { product: Product })[]>();
    for (const item of items) {
      if (item.order_items && item.products) {
        const orderId = item.order_items.orderId;
        if (!itemsMap.has(orderId)) {
          itemsMap.set(orderId, []);
        }
        itemsMap.get(orderId)!.push({ ...item.order_items, product: item.products });
      }
    }

    return allOrders.map(order => ({
      ...order,
      orderItems: itemsMap.get(order.id) || [],
      user: usersMap.get(order.userId)!,
      status: order.orderStatus, // alias for backward compatibility
    }));
  }

  // ... (rest of the methods remain the same)
  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    const ordersMap = new Map<string, OrderWithItems>();
    
    for (const row of result) {
      if (!ordersMap.has(row.orders.id)) {
        ordersMap.set(row.orders.id, {
          ...row.orders,
          orderItems: [],
          user: {} as any, // Will be populated if needed  
          status: row.orders.orderStatus // Add backward compatibility alias
        } as OrderWithItems);
      }
      
      if (row.order_items && row.products) {
        ordersMap.get(row.orders.id)!.orderItems.push({
          ...row.order_items,
          product: row.products
        });
      }
    }
    
    return Array.from(ordersMap.values());
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.id, id));
    
    if (result.length === 0) return undefined;
    
    const order: OrderWithItems = {
      ...result[0].orders,
      orderItems: [],
      user: {} as any, // Will be populated if needed
      status: result[0].orders.orderStatus // Add backward compatibility alias
    };
    
    for (const row of result) {
      if (row.order_items && row.products) {
        order.orderItems.push({
          ...row.order_items,
          product: row.products
        });
      }
    }
    
    return order;
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    
    const orderItemsData = items.map(item => ({
      ...item,
      orderId: order.id
    }));