import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

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
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      const products = category && category !== 'all'
        ? await storage.getProductsByCategory(category as string)
        : await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // --- Authenticated User Routes ---
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items, deliveryAddress, paymentMethod, phoneNumber } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }

      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'product'}` });
        }
        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal.toString(),
          orderId: "", // Dummy value to satisfy TypeScript
        });
      }

      const orderData = {
        userId,
        totalAmount: totalAmount.toFixed(2),
        paymentMethod,
        deliveryAddress,
        hostelBlock: deliveryAddress.hostelBlock,
        roomNumber: deliveryAddress.roomNumber,
        phoneNumber,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
        orderStatus: 'placed'
      };

      const order = await storage.createOrder(orderData, orderItemsData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // --- Admin Routes ---
  app.use('/api/admin', isAdmin);

  app.get('/api/admin/orders', async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Failed to fetch all orders" });
    }
  });

  app.post('/api/admin/products', async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/admin/products/:id', async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.put('/api/admin/products/:id/stock', async (req, res) => {
    try {
      const product = await storage.updateProductStock(req.params.id, req.body.quantity);
      res.json(product);
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  app.put('/api/admin/orders/:id/status', async (req, res) => {
    try {
      const order = await storage.updateOrderStatus(req.params.id, req.body.status);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}