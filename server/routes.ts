import type { Express } from "express";
import { createServer, type Server } from "http";
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
      // ... (order creation logic remains the same)
      const userId = req.user.id;
      const { items, deliveryAddress, paymentMethod, phoneNumber, paymentNote } = req.body;
      let totalAmount = 0;
      const orderItemsData: Omit<InsertOrderItem, 'orderId'>[] = [];
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product || !product.isActive || product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'product'}` });
        }
        // Enforce per-product payment methods
        if (paymentMethod === 'cash' && (product as any).allowCash === false) {
          return res.status(400).json({ message: `Cash is not available for ${product.name}` });
        }
        if (paymentMethod === 'upi' && (product as any).allowUpi === false) {
          return res.status(400).json({ message: `UPI is not available for ${product.name}` });
        }
        // No discounts – charge base price
        const base = parseFloat(product.price);
        const unitAfter = base;
        const itemTotal = base * item.quantity;
        totalAmount += itemTotal;
        orderItemsData.push({ productId: item.productId, quantity: item.quantity, unitPrice: unitAfter.toFixed(2) as any, totalPrice: itemTotal.toFixed(2)});
      }
      // No global discount application

      const orderData: InsertOrder = { userId, totalAmount: totalAmount.toFixed(2), paymentMethod, deliveryAddress, hostelBlock: deliveryAddress.hostelBlock, roomNumber: deliveryAddress.roomNumber, phoneNumber, paymentNote, paymentStatus: 'pending', orderStatus: 'placed' } as any;
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