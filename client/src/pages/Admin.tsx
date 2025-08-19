import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Product, OrderWithItems, InsertProduct } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { toast } = useToast();
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      await apiRequest("POST", "/api/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductFormOpen(false);
      setEditingProduct(null);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please login again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      await apiRequest("PUT", `/api/admin/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductFormOpen(false);
      setEditingProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please login again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest("PUT", `/api/admin/products/${id}/stock`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please login again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please login again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      categoryId: formData.get("category") as string,
      imageUrl: formData.get("imageUrl") as string,
      stock: parseInt(formData.get("stock") as string),
      isActive: true,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleStockUpdate = (productId: string, change: number) => {
    updateStockMutation.mutate({ id: productId, quantity: change });
  };

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      preparing: "secondary",
      ready: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-charcoal" data-testid="admin-title">
              Admin Dashboard
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === "products"
                  ? "bg-primary text-white"
                  : "bg-gray-light text-charcoal hover:bg-gray-300"
              }`}
              data-testid="products-tab"
            >
              <i className="fas fa-box mr-2"></i>Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === "orders"
                  ? "bg-primary text-white"
                  : "bg-gray-light text-charcoal hover:bg-gray-300"
              }`}
              data-testid="orders-tab"
            >
              <i className="fas fa-shopping-bag mr-2"></i>Orders
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === "products" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-charcoal">Product Management</h2>
                <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setEditingProduct(null)}
                      data-testid="add-product-button"
                      className="bg-primary hover:bg-primary-dark"
                    >
                      <i className="fas fa-plus mr-2"></i>Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={editingProduct?.name || ""}
                          required
                          data-testid="product-name-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingProduct?.description || ""}
                          data-testid="product-description-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={editingProduct?.price || ""}
                          required
                          data-testid="product-price-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue={editingProduct?.category || ""} required>
                          <SelectTrigger data-testid="product-category-select">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="snacks">Snacks</SelectItem>
                            <SelectItem value="drinks">Drinks</SelectItem>
                            <SelectItem value="instant">Instant Food</SelectItem>
                            <SelectItem value="sweets">Sweets</SelectItem>
                            <SelectItem value="dairy">Dairy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                          id="imageUrl"
                          name="imageUrl"
                          type="url"
                          defaultValue={editingProduct?.imageUrl || ""}
                          data-testid="product-image-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Initial Stock</Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          min="0"
                          defaultValue={editingProduct?.stock || 0}
                          required
                          data-testid="product-stock-input"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setProductFormOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          className="flex-1 bg-primary hover:bg-primary-dark"
                          data-testid="product-submit-button"
                        >
                          {createProductMutation.isPending || updateProductMutation.isPending
                            ? "Saving..." 
                            : editingProduct ? "Update" : "Create"
                          }
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  products.map((product: Product) => (
                    <Card key={product.id} data-testid={`product-card-${product.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-charcoal">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                            <p className="text-lg font-bold text-primary">₹{product.price}</p>
                            <Badge variant="outline">{product.category}</Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setProductFormOpen(true);
                            }}
                            data-testid={`edit-product-${product.id}`}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Stock: {product.stock}</span>
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStockUpdate(product.id, -1)}
                                disabled={updateStockMutation.isPending}
                                data-testid={`decrease-stock-${product.id}`}
                              >
                                <i className="fas fa-minus"></i>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStockUpdate(product.id, 1)}
                                disabled={updateStockMutation.isPending}
                                data-testid={`increase-stock-${product.id}`}
                              >
                                <i className="fas fa-plus"></i>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-6">Order Management</h2>
              
              <div className="space-y-4">
                {ordersLoading ? (
                  [...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  orders.map((order: OrderWithItems) => (
                    <Card key={order.id} data-testid={`order-card-${order.id}`}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </CardTitle>
                          <div className="flex space-x-2">
                            {getOrderStatusBadge(order.status)}
                            <Select
                              defaultValue={order.status}
                              onValueChange={(status) => 
                                updateOrderStatusMutation.mutate({ id: order.id, status })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                            <p className="text-sm text-gray-600">{order.user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Delivery</p>
                            <p className="font-medium">{order.hostelBlock} - Room {order.roomNumber}</p>
                            <p className="text-sm text-gray-600">Phone: {order.phoneNumber}</p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <p className="text-sm text-gray-600 mb-2">Items:</p>
                          <div className="space-y-2">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.product.name} x {item.quantity}</span>
                                <span>₹{Number(item.price) * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                            <span>Total:</span>
                            <span className="text-primary">₹{order.totalAmount}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                          <span>Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</span>
                          <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
