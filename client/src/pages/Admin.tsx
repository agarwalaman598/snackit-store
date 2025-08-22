import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { playSuccessSound, playClickSound } from "@/lib/sounds";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product, OrderWithItems, InsertProduct, Category, Settings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [pickupMessageEdits, setPickupMessageEdits] = useState<Record<string, string>>({});

  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: orders = [] } = useQuery<OrderWithItems[]>({ queryKey: ["/api/admin/orders"], refetchInterval: 5000 });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: settings, refetch: refetchSettings } = useQuery<Settings>({ queryKey: ["/api/admin/settings"] });

  // Local editable settings + autosave
  const [localSettings, setLocalSettings] = useState<Partial<Settings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSettingsRef = useRef<Partial<Settings> | null>(null);

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const saveSettingsNow = async (payload: Partial<Settings>) => {
    const prev = prevSettingsRef.current;
    try {
      setIsSaving(true);
      await apiRequest("PUT", "/api/admin/settings", payload);
      await refetchSettings();
      // success: clear snapshot
      prevSettingsRef.current = null;
      toast({ title: "Saved", description: "Settings updated." });
      playSuccessSound();
    } catch (err: any) {
      // Rollback optimistic local settings if we have a snapshot
      if (prev) {
        setLocalSettings(prev);
        prevSettingsRef.current = null;
      }
      toast({ title: "Error", description: err?.message ?? "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const scheduleSave = (partial: Partial<Settings>) => {
    // capture snapshot before optimistic update if none exists
    setLocalSettings(prev => {
      if (!prevSettingsRef.current) prevSettingsRef.current = prev ? { ...prev } : {};
      return { ...(prev || {}), ...partial };
    });
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      // send merged payload based on latest localSettings
      saveSettingsNow({ ...(localSettings || {}), ...partial });
      saveTimeoutRef.current = null;
    }, 700);
  };

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

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; icon?: string; slug?: string }) => apiRequest("POST", "/api/admin/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setCategoryFormOpen(false);
      toast({ title: "Success", description: "Category created." });
      playSuccessSound();
    },
    onError: (error: any) => toast({ title: "Error", description: error?.message ?? "Failed to create category.", variant: "destructive" }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: 'Success', description: 'Category deleted.' });
      playSuccessSound();
    },
    onError: (error: any) => toast({ title: 'Error', description: error?.message ?? 'Failed to delete category', variant: 'destructive' }),
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

  const updatePickupMessageMutation = useMutation({
    mutationFn: ({ id, pickupMessage }: { id: string; pickupMessage: string }) => apiRequest("PUT", `/api/admin/orders/${id}/pickup-message`, { pickupMessage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Success", description: "Pickup message updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to update pickup message.", variant: "destructive" }),
  });

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  const data: InsertProduct = { name: formData.get("name") as string, description: formData.get("description") as string, price: formData.get("price") as string, categoryId: formData.get("categoryId") as string, imageUrl: formData.get("imageUrl") as string, stock: parseInt(formData.get("stock") as string, 10), isActive: true };
  const allowCash = (formData.get("allowCash") as unknown) !== null;
  const allowUpi = (formData.get("allowUpi") as unknown) !== null;
  // Extend payload with payment flags. Product-level discounts are handled by DB defaults/settings and removed from the admin form.
  const payload = { ...data, allowCash, allowUpi } as unknown as InsertProduct & { allowCash: boolean; allowUpi: boolean };
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createProductMutation.mutate(payload);
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
            {/* Settings Panel */}
            <Card className="border border-gray-100 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-black text-gray-900">Store Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pickup Point</label>
                    <Input value={localSettings?.pickupPoint ?? ''} onChange={(e) => scheduleSave({ pickupPoint: e.currentTarget.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                    <Input value={localSettings?.contactPhone ?? ''} onChange={(e) => scheduleSave({ contactPhone: e.currentTarget.value })} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">UPI ID (optional)</label>
                    <Input value={localSettings?.upiId ?? ''} onChange={(e) => scheduleSave({ upiId: e.currentTarget.value || null })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">UPI QR URL (optional)</label>
                    <Input value={localSettings?.upiQrUrl ?? ''} onChange={(e) => scheduleSave({ upiQrUrl: e.currentTarget.value || null })} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={localSettings?.acceptingOrders !== false} onChange={(e) => scheduleSave({ acceptingOrders: e.currentTarget.checked })} />
                    <span>Accepting Orders</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Resume at</span>
                    <Input type="datetime-local" value={localSettings?.resumeAt ? new Date(localSettings.resumeAt).toISOString().slice(0,16) : ''} onChange={(e) => scheduleSave({ resumeAt: e.currentTarget.value ? new Date(e.currentTarget.value) : null })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => { if (saveTimeoutRef.current) { clearTimeout(saveTimeoutRef.current); saveTimeoutRef.current = null; } saveSettingsNow(localSettings || {}); }} className="btn-primary">Save Now</Button>
                    <Button onClick={async () => { playClickSound(); await refetchSettings(); toast({ title: "Refreshed", description: "Settings reloaded." }); }} className="btn-secondary">Refresh</Button>
                    {isSaving && <div className="text-sm text-gray-500">Saving…</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-gray-900">Product Management</h2>
                  <div className="flex items-center gap-2">
                    <Dialog open={categoryFormOpen} onOpenChange={setCategoryFormOpen}>
                      <DialogTrigger asChild>
                        <Button className="btn-secondary">Add Category</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-black text-gray-900">Add Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget as HTMLFormElement);
                          const payload = { name: fd.get('name') as string, icon: fd.get('icon') as string || undefined, slug: fd.get('slug') as string || undefined };
                          createCategoryMutation.mutate(payload);
                        }} className="space-y-4">
                          <Input name="name" placeholder="Category name" required />
                          <Input name="icon" placeholder="Icon (e.g., fas fa-pizza)" />
                          <Input name="slug" placeholder="Optional slug" />
                          <Button type="submit" className="w-full btn-primary">Create Category</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingProduct(null)} className="btn-primary">
                        <i className="fas fa-plus mr-2"></i>Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                            {categories.map(c => (
                              <SelectItem key={c.id} value={c.id}><i className={`${c.icon} mr-2 text-lg`} />{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input name="imageUrl" placeholder="Image URL" type="url" defaultValue={editingProduct?.imageUrl ?? ""} className="border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
                        <Input name="stock" type="number" placeholder="Stock" defaultValue={editingProduct?.stock ?? 0} required className="border-gray-200 focus:border-orange-500 focus:ring-orange-500" />
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" name="allowCash" defaultChecked={editingProduct?.allowCash ?? true} />
                            <span>Allow Cash</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" name="allowUpi" defaultChecked={editingProduct?.allowUpi ?? true} />
                            <span>Allow UPI</span>
                          </label>
                        </div>
                        {/* Product-level discount fields removed — discounts are managed globally via Store Settings */}
                        <Button type="submit" className="w-full btn-primary">
                          Save Product
                        </Button>
                      </form>
                    </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Card className="border border-gray-100 shadow-lg">
                  <div className="p-4 flex items-center gap-3">
                          <Input placeholder="Search products..." onChange={(e) => {
                      const term = e.currentTarget.value.toLowerCase();
                      queryClient.setQueryData(["/api/products"], (products as Product[]).filter((p: Product) => p.name.toLowerCase().includes(term)));
                    }} />
                    <Select onValueChange={(catId) => {
                      if (!catId) return;
                      queryClient.setQueryData(["/api/products"], (products as Product[]).filter((p: Product) => p.categoryId === catId));
                    }}>
                      <SelectTrigger className="w-56">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.id}><i className={`${c.icon} mr-2 text-lg`} />{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                    <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-bold text-gray-900">Name</TableHead>
                        <TableHead className="font-bold text-gray-900">Category</TableHead>
                        <TableHead className="font-bold text-gray-900">Price</TableHead>
                        <TableHead className="font-bold text-gray-900">Stock</TableHead>
                        <TableHead className="font-bold text-gray-900">Payments</TableHead>
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
                          <TableCell className="text-gray-600">
                            <div className="flex gap-2">
                              {product.allowCash !== false && <Badge variant="secondary">Cash</Badge>}
                              {product.allowUpi !== false && <Badge variant="secondary">UPI</Badge>}
                            </div>
                          </TableCell>
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

                {/* Category management list */}
                <Card className="border border-gray-100 shadow-lg mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-black">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-3">
                            <i className={`${c.icon} text-2xl`} />
                            <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-gray-500">{c.slug}</div>
                            </div>
                          </div>
                          <div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete category?</AlertDialogTitle>
                                  <AlertDialogDescription>Deleting a category is irreversible. Ensure no products are assigned to this category.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteCategoryMutation.mutate(c.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Order Management</h2>
                <Card className="border border-gray-100 shadow-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-bold text-gray-900">Order</TableHead>
                        <TableHead className="font-bold text-gray-900">User</TableHead>
                        <TableHead className="font-bold text-gray-900">Phone</TableHead>
                        <TableHead className="font-bold text-gray-900">Room</TableHead>
                        <TableHead className="font-bold text-gray-900">Amount</TableHead>
                        <TableHead className="font-bold text-gray-900">Payment</TableHead>
                        <TableHead className="font-bold text-gray-900">Status</TableHead>
                        <TableHead className="font-bold text-gray-900">Pickup</TableHead>
                        <TableHead className="text-right font-bold text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map(order => (
                        <TableRow key={order.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</TableCell>
                          <TableCell className="text-gray-600">{order.user.firstName} {order.user.lastName}</TableCell>
                          <TableCell className="text-gray-600">{order.phoneNumber}</TableCell>
                          <TableCell className="text-gray-600">{order.hostelBlock}-{order.roomNumber}</TableCell>
                          <TableCell className="font-bold text-orange-600">₹{order.totalAmount}</TableCell>
                          <TableCell className="text-gray-600">{order.paymentMethod.toUpperCase()}</TableCell>
                          <TableCell>
                            <Select defaultValue={order.status} onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}>
                              <SelectTrigger className="w-36 border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {['placed','confirmed','preparing','ready','delivered','cancelled'].map(s => (
                                  <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="w-80">
                            <div className="flex items-center space-x-2">
                              <Input 
                                placeholder="e.g., Collect from 6A-298 in 10-15 minutes"
                                value={pickupMessageEdits[order.id] ?? order.pickupMessage ?? ''}
                                onChange={(e) => setPickupMessageEdits(prev => ({ ...prev, [order.id]: e.target.value }))}
                              />
                              <Button size="sm" onClick={() => updatePickupMessageMutation.mutate({ id: order.id, pickupMessage: pickupMessageEdits[order.id] ?? '' })}>Save</Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">View</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-black text-gray-900">Order Details #{order.id.slice(-6).toUpperCase()}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {order.orderItems.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                      <div className="text-gray-700">{item.product.name} × {item.quantity}</div>
                                      <div className="font-bold text-orange-600">₹{Number(item.unitPrice) * item.quantity}</div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}