import {
  users, categories, products, orders, orderItems,
  type User, type UpsertUser, type Category,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type ProductWithCategory,
  type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql } from "drizzle-orm";

export class DatabaseStorage {
  // USER METHODS
  async getUser(id: string): Promise<User | undefined> {
    return await db.query.users.findFirst({ where: eq(users.id, id) });
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
    return await db.query.categories.findMany({ orderBy: [asc(categories.name)] });
  }

  // PRODUCT METHODS
  async getProducts(): Promise<ProductWithCategory[]> {
    return await db.query.products.findMany({
      where: eq(products.isActive, true),
      with: { category: true },
      orderBy: [asc(products.name)],
    });
  }
  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    return await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true },
    });
  }
  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }
  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set({ ...updates, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return product;
  }
  async deleteProduct(id: string): Promise<boolean> {
    const updated = await db.update(products).set({ isActive: false }).where(eq(products.id, id)).returning({ id: products.id });
    return updated.length > 0;
  }

  // ORDER METHODS
  async getOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.query.orders.findMany({
      with: {
        user: true,
        orderItems: { with: { product: true } },
      },
      orderBy: [desc(orders.createdAt)],
    });
    return allOrders.map(order => ({ ...order, status: order.orderStatus }));
  }

  // CORRECTED USER ORDERS METHOD
  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
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
    return userOrders.map(order => ({ ...order, status: order.orderStatus }));
  }

  async createOrder(orderData: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
      const orderItemsData = items.map(item => ({ ...item, orderId: order.id }));
      await tx.insert(orderItems).values(orderItemsData);
      for (const item of items) {
        await tx.update(products).set({ stock: sql`${products.stock} - ${item.quantity}` }).where(eq(products.id, item.productId));
      }
      return order;
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ orderStatus: status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return order;
  }
}

export const storage = new DatabaseStorage();