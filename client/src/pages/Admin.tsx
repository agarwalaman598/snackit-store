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
    onSuccess: (...args) => {
      mutationOptions.onSuccess();
      toast({ title: "Success", description: "Product created successfully." });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProduct> }) =>
      apiRequest("PUT", `/api/admin/products/${id}`, data),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess();
      toast({ title: "Success", description: "Product updated successfully." });
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

  // ... (rest of the component remains the same)

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-charcoal mb-8">Admin Dashboard</h1>
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-sm font-medium ${activeTab === "products"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-sm font-medium ${activeTab === "orders"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
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
                    <Button onClick={() => setEditingProduct(null)}>
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={editingProduct?.description ?? ""} />
                      </div>
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                      </div>
                      <div>
                        <Label htmlFor="categoryId">Category</Label>
                        <Select name="categoryId" defaultValue={editingProduct?.categoryId} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input id="imageUrl" name="imageUrl" type="url" defaultValue={editingProduct?.imageUrl ?? ""} />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input id="stock" name="stock" type="number" defaultValue={editingProduct?.stock ?? 0} required />
                      </div>
                      <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                        {editingProduct ? "Update Product" : "Create Product"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsLoading ? (
                  <p>Loading products...</p>
                ) : (
                  products.map((product) => (
                    <Card key={product.id}>
                      <CardHeader>
                        <CardTitle>{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Price: ₹{product.price}</p>
                        <p>Stock: {product.stock}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductFormOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
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
                   <Card key={order.id} data-testid={`order-card-${order.id}`}>
                     <CardHeader>
                       <div className="flex justify-between items-center">
                         <CardTitle className="text-lg">
                           Order #{order.id.slice(-8).toUpperCase()}
                         </CardTitle>
                         {/* ... order status controls */}
                       </div>
                     </CardHeader>
                     <CardContent>
                       {/* ... order details */}
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