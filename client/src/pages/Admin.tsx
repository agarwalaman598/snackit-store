import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product, OrderWithItems, InsertProduct, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({ queryKey: ["/api/admin/orders"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const productMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductFormOpen(false);
      setEditingProduct(null);
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  };

  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/admin/products", data),
    ...productMutationOptions,
    onSuccess: () => {
      productMutationOptions.onSuccess();
      toast({ title: "Success", description: "Product created." });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProduct> }) => apiRequest("PUT", `/api/admin/products/${id}`, data),
    ...productMutationOptions,
    onSuccess: () => {
      productMutationOptions.onSuccess();
      toast({ title: "Success", description: "Product updated." });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiRequest("PUT", `/api/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Success", description: "Order status updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" }),
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

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-light">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-charcoal mb-8">Admin Dashboard</h1>
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              <button onClick={() => setActiveTab("products")} className={`${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Products</button>
              <button onClick={() => setActiveTab("orders")} className={`${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Orders</button>
            </nav>
          </div>
          <div className="mt-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Product Management</h2>
                  <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
                    <DialogTrigger asChild><Button onClick={() => setEditingProduct(null)}>Add Product</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <Input name="name" placeholder="Name" defaultValue={editingProduct?.name} required />
                        <Textarea name="description" placeholder="Description" defaultValue={editingProduct?.description ?? ""} />
                        <Input name="price" type="number" step="0.01" placeholder="Price" defaultValue={editingProduct?.price} required />
                        <Select name="categoryId" defaultValue={editingProduct?.categoryId} required>
                          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                          <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input name="imageUrl" placeholder="Image URL" type="url" defaultValue={editingProduct?.imageUrl ?? ""} />
                        <Input name="stock" type="number" placeholder="Stock" defaultValue={editingProduct?.stock ?? 0} required />
                        <Button type="submit" className="w-full">Save Product</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Card>
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {productsLoading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow> : products.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{categories.find(c => c.id === product.categoryId)?.name}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => { setEditingProduct(product); setProductFormOpen(true); }}>Edit</Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-6">Order Management</h2>
                <div className="space-y-4">
                  {ordersLoading ? <p>Loading orders...</p> : orders.map(order => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <CardTitle className="text-lg">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge>{order.orderStatus}</Badge>
                            <Select value={order.orderStatus} onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}>
                              <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
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
                         <p><strong>Customer:</strong> {order.user?.firstName} {order.user?.lastName}</p>
                         <p><strong>Deliver to:</strong> {order.hostelBlock}, Room {order.roomNumber}</p>
                         <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                         <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}