import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Product, OrderWithItems, InsertProduct, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setProductFormOpen(false);
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  };

  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/admin/products", data),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast({ title: "Success", description: "Product created successfully." });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProduct> }) =>
      apiRequest("PUT", `/api/admin/products/${id}`, data),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast({ title: "Success", description: "Product updated successfully." });
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
    onError: (error: Error) => {
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
    const data: InsertProduct = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      categoryId: formData.get("categoryId") as string,
      imageUrl: formData.get("imageUrl") as string,
      stock: parseInt(formData.get("stock") as string, 10),
      isActive: true,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      placed: "outline",
      preparing: "secondary",
      delivered: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-light">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-charcoal mb-8">Admin Dashboard</h1>
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "products"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "orders"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Orders
            </button>
          </div>

          {activeTab === "products" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Product Management</h2>
                <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingProduct(null)}>Add Product</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      {/* Form fields... */}
                      <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                        {editingProduct ? "Update Product" : "Create Product"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Product Grid */}
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-6">Order Management</h2>
              <div className="space-y-4">
                {ordersLoading ? (
                  <p>Loading orders...</p>
                ) : (
                  orders.map((order: OrderWithItems) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {getOrderStatusBadge(order.orderStatus)}
                            <Select
                              value={order.orderStatus}
                              onValueChange={(status) =>
                                updateOrderStatusMutation.mutate({ id: order.id, status })
                              }
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="placed">Placed</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="font-semibold text-gray-700">Customer</p>
                            <p>{order.user.firstName} {order.user.lastName}</p>
                            <p className="text-muted-foreground">{order.user.email}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700">Delivery</p>
                            <p>{order.hostelBlock} - Room {order.roomNumber}</p>
                            <p className="text-muted-foreground">Phone: {order.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <p className="text-sm font-semibold mb-2">Items:</p>
                          <div className="space-y-2 text-sm">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between">
                                <span className="text-muted-foreground">
                                  {item.product.name} x {item.quantity}
                                </span>
                                <span>₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                            <span>Total:</span>
                            <span className="text-primary">₹{order.totalAmount}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
                          <span>Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</span>
                          <span>
                            {new Date(order.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
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