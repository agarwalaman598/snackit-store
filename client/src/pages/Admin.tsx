import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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

  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: orders = [] } = useQuery<OrderWithItems[]>({ queryKey: ["/api/admin/orders"] });
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
    onSuccess: () => { productMutationOptions.onSuccess(); toast({ title: "Success", description: "Product created." }); },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProduct> }) => apiRequest("PUT", `/api/admin/products/${id}`, data),
    ...productMutationOptions,
    onSuccess: () => { productMutationOptions.onSuccess(); toast({ title: "Success", description: "Product updated." }); },
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/products/${id}`),
    ...productMutationOptions,
    onSuccess: () => {
      productMutationOptions.onSuccess();
      toast({ title: "Success", description: "Product deleted." });
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
    const data: InsertProduct = { name: formData.get("name") as string, description: formData.get("description") as string, price: formData.get("price") as string, categoryId: formData.get("categoryId") as string, imageUrl: formData.get("imageUrl") as string, stock: parseInt(formData.get("stock") as string, 10), isActive: true };
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
          <Breadcrumb />
          <h1 className="text-4xl font-black text-gray-900 mb-8">Admin Dashboard</h1>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab("products")} 
                className={`${
                  activeTab === 'products' 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors duration-200`}
              >
                Products
              </button>
              <button 
                onClick={() => setActiveTab("orders")} 
                className={`${
                  activeTab === 'orders' 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors duration-200`}
              >
                Orders
              </button>
            </nav>
          </div>
          <div className="mt-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-gray-900">Product Management</h2>
                  <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingProduct(null)} className="btn-primary">
                        <i className="fas fa-plus mr-2"></i>Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black text-gray-900">
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <Input name="name" placeholder="Name" defaultValue={editingProduct?.name} required className="border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
                        <Textarea name="description" placeholder="Description" defaultValue={editingProduct?.description ?? ""} className="border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
                        <Input name="price" type="number" step="0.01" placeholder="Price" defaultValue={editingProduct?.price} required className="border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
                        <Select name="categoryId" defaultValue={editingProduct?.categoryId} required>
                          <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input name="imageUrl" placeholder="Image URL" type="url" defaultValue={editingProduct?.imageUrl ?? ""} className="border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
                        <Input name="stock" type="number" placeholder="Stock" defaultValue={editingProduct?.stock ?? 0} required className="border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
                        <Button type="submit" className="w-full btn-primary">
                          Save Product
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Card className="border border-gray-100 shadow-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-bold text-gray-900">Name</TableHead>
                        <TableHead className="font-bold text-gray-900">Category</TableHead>
                        <TableHead className="font-bold text-gray-900">Price</TableHead>
                        <TableHead className="font-bold text-gray-900">Stock</TableHead>
                        <TableHead className="text-right font-bold text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(product => (
                        <TableRow key={product.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                          <TableCell className="text-gray-600">{categories.find(c => c.id === product.categoryId)?.name}</TableCell>
                          <TableCell className="font-bold text-orange-600">₹{product.price}</TableCell>
                          <TableCell className="text-gray-600">{product.stock}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { setEditingProduct(product); setProductFormOpen(true); }}
                              className="border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-black text-gray-900">Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600">
                                    This will permanently delete the product. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteProductMutation.mutate(product.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Order Management</h2>
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-list text-4xl mb-4"></i>
                  <p>Order management features coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}