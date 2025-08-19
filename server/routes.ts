import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { insertProductSchema, insertCategorySchema, type InsertOrderItem, type InsertOrder } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

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
    const { category } = req.query;
    const products = category && category !== 'all'
      ? await storage.getProductsByCategory(category as string)
      : await storage.getProducts();
    res.json(products);
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items, deliveryAddress, paymentMethod, phoneNumber } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }

      let totalAmount = 0;
      const orderItemsData: Omit<InsertOrderItem, 'orderId'>[] = [];

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
          totalPrice: itemTotal.toFixed(2)
        });
      }

      const orderData: InsertOrder = {
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

  // Admin Routes
  app.post('/api/admin/products', isAdmin, async (req, res) => {
    const productData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  });
  
  app.get('/api/admin/orders', isAdmin, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.put('/api/admin/orders/:id/status', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await storage.updateOrderStatus(id, status);
    res.json(order);
  });
  
  app.put('/api/admin/products/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const product = await storage.updateProduct(id, req.body);
    res.json(product);
  });

  const httpServer = createServer(app);
  return httpServer;
}