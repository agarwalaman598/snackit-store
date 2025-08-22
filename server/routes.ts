import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from 'zod';
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { insertProductSchema, insertSettingsSchema, type InsertOrderItem, type InsertOrder } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // --- Public Routes ---
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  app.get('/api/categories', async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get('/api/products', async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Public settings (read-only)
  app.get('/api/settings', async (req, res) => {
    const s = await storage.getSettings();
    res.json(s);
  });

  // --- Authenticated User Routes ---
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      // Respect accepting orders flag
      const s = await storage.getSettings();
      if (s && s.acceptingOrders === false) {
        return res.status(400).json({ message: "We are not accepting new orders right now." });
      }
      // Validate request body
      const createOrderSchema = z.object({
        items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })),
        deliveryAddress: z.any(),
        paymentMethod: z.enum(['cash', 'upi']),
        phoneNumber: z.string().min(3),
        paymentNote: z.string().optional(),
      });

      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid order payload', errors: parsed.error.errors });
      }

      const { items, deliveryAddress, paymentMethod, phoneNumber, paymentNote } = parsed.data;
      const userId = req.user.id;
      let totalAmount = 0;
      const orderItemsData: Omit<InsertOrderItem, 'orderId'>[] = [];
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product || !product.isActive || product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'product'}` });
        }
        // Enforce per-product payment methods
  if (paymentMethod === 'cash' && product.allowCash === false) {
          return res.status(400).json({ message: `Cash is not available for ${product.name}` });
        }
  if (paymentMethod === 'upi' && product.allowUpi === false) {
          return res.status(400).json({ message: `UPI is not available for ${product.name}` });
        }
        // No discounts – charge base price
        const base = parseFloat(product.price);
        const unitAfter = base;
        const itemTotal = base * item.quantity;
        totalAmount += itemTotal;
        orderItemsData.push({ productId: item.productId, quantity: item.quantity, unitPrice: unitAfter.toFixed(2), totalPrice: itemTotal.toFixed(2)});
      }
      // No global discount application
      const orderData: InsertOrder = {
        userId,
        totalAmount: totalAmount.toFixed(2),
        paymentMethod,
        deliveryAddress,
        hostelBlock: deliveryAddress.hostelBlock,
        roomNumber: deliveryAddress.roomNumber,
        phoneNumber,
        paymentNote: paymentNote ?? null,
        paymentStatus: 'pending',
        orderStatus: 'placed',
      };
      const order = await storage.createOrder(orderData, orderItemsData);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // --- Admin Routes ---
  app.get('/api/admin/orders', isAdmin, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });
  app.get('/api/admin/settings', isAdmin, async (req, res) => {
    const s = await storage.getSettings();
    res.json(s);
  });
  app.put('/api/admin/settings', isAdmin, async (req, res) => {
    const body = { ...req.body };
    if (typeof body.resumeAt === 'string' && body.resumeAt) {
      body.resumeAt = new Date(body.resumeAt);
    }
    if (body.resumeAt === '') body.resumeAt = null;
    // Coerce numeric fields from strings
    for (const key of ['discountCashPercent','discountUpiPercent'] as const) {
      if (body[key] !== undefined) body[key] = Number(body[key]);
    }
    if (typeof body.acceptingOrders === 'string') {
      body.acceptingOrders = body.acceptingOrders === 'true';
    }
    const parsed = insertSettingsSchema.partial().parse(body);
    const updated = await storage.updateSettings(parsed);
    res.json(updated);
  });
  
  app.post('/api/admin/products', isAdmin, async (req, res) => {
    const productData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  });

  // Admin: create category
  app.post('/api/admin/categories', isAdmin, async (req, res) => {
    try {
      const body = req.body;
      if (!body.name) return res.status(400).json({ message: 'Name is required' });
      const created = await storage.createCategory({ name: body.name, icon: body.icon ?? 'fas fa-utensils', slug: body.slug });
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create category' });
    }
  });

  app.put('/api/admin/products/:id', isAdmin, async (req, res) => {
    const product = await storage.updateProduct(req.params.id, req.body);
    res.json(product);
  });

  // --- NEW DELETE ROUTE ---
  app.delete('/api/admin/products/:id', isAdmin, async (req, res) => {
    const success = await storage.deleteProduct(req.params.id);
    if (success) {
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  });
  // -------------------------

  // Admin: delete category
  app.delete('/api/admin/categories/:id', isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (success) return res.status(200).json({ message: 'Category deleted' });
      return res.status(404).json({ message: 'Category not found' });
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? 'Failed to delete category' });
    }
  });

  app.put('/api/admin/orders/:id/status', isAdmin, async (req, res) => {
    const order = await storage.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  });

  app.put('/api/admin/orders/:id/pickup-message', isAdmin, async (req, res) => {
    const order = await storage.updateOrderPickupMessage(req.params.id, req.body.pickupMessage ?? null);
    res.json(order);
  });

  const httpServer = createServer(app);
  return httpServer;
}