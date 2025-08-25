import {
  users, categories, products, orders, orderItems, settings,
  type User, type UpsertUser, type Category,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type ProductWithCategory,
  type OrderWithItems, type Settings, type InsertSettings
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

  async createCategory(categoryData: { name: string; icon: string; slug?: string }): Promise<Category> {
    const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [category] = await db.insert(categories).values({ name: categoryData.name, icon: categoryData.icon || 'fas fa-utensils', slug }).returning();
    return category;
  }

  async deleteCategory(id: string): Promise<{ deleted: boolean; movedCount?: number; movedTo?: string; moved?: { id: string; name: string }[] }> {
    // Prevent hard delete of uncategorized
    const uncategorized = await db.query.categories.findFirst({ where: eq(categories.slug, 'uncategorized') });
    if (uncategorized && uncategorized.id === id) {
      throw new Error('Cannot delete uncategorized category');
    }
    // Find any products referencing this category (active or inactive)
    const linked = await db.query.products.findMany({
      where: eq(products.categoryId, id),
      columns: { id: true, name: true },
    });
    let movedToId: string | undefined = undefined;
    let movedCount = 0;
    if (linked.length > 0) {
      // Ensure an 'uncategorized' category exists to receive reassigned products
      let uncat = uncategorized;
      if (!uncat) {
        const slug = 'uncategorized';
        const [created] = await db.insert(categories).values({ name: 'Uncategorized', icon: 'fas fa-folder-open', slug }).returning();
        uncat = created;
      }
      movedToId = uncat.id;
      // Reassign products in a transaction to ensure consistency
      await db.transaction(async (tx) => {
        await tx.update(products).set({ categoryId: movedToId, updatedAt: new Date() }).where(eq(products.categoryId, id));
      });
      movedCount = linked.length;
    }
    // Hard delete the category
    const deleted = await db.delete(categories).where(eq(categories.id, id)).returning();
    return { deleted: deleted.length > 0, movedCount: movedCount || undefined, movedTo: movedToId, moved: movedCount > 0 ? linked.map(p => ({ id: p.id, name: p.name })) : undefined };
  }

  // PRODUCT METHODS
  async getProducts(): Promise<ProductWithCategory[]> {
    return await db.query.products.findMany({
      where: eq(products.isActive, true),
      with: { category: true },
      orderBy: [asc(products.name)],
    });
  }

  // Return all products regardless of isActive (for admin use)
  async getAllProducts(): Promise<ProductWithCategory[]> {
    return await db.query.products.findMany({
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
  // Hard delete the product
  const deleted = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  return deleted.length > 0;
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

  async updateOrderPickupMessage(id: string, pickupMessage: string | null): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ pickupMessage, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // SETTINGS METHODS
  async getSettings(): Promise<Settings> {
    const row = await db.query.settings.findFirst({});
    if (row) return row;
    const [created] = await db
      .insert(settings)
      .values({ id: 'default' })
      .onConflictDoNothing()
      .returning();
    return created || (await db.query.settings.findFirst({}))!;
  }

  async updateSettings(data: Partial<InsertSettings>): Promise<Settings> {
    const [row] = await db
      .update(settings)
      .set({ ...(data as Partial<InsertSettings>), updatedAt: new Date() })
      .where(eq(settings.id, 'default'))
      .returning();
    return row;
  }
}

export const storage = new DatabaseStorage();