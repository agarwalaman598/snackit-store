import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderWithItems } from "@shared/schema";

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

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

  const getOrderStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      pending: "Your order is being processed",
      confirmed: "Order confirmed! We're preparing your items",
      preparing: "Your delicious snacks are being prepared",
      ready: "Your order is ready for pickup/delivery",
      delivered: "Order delivered successfully!",
      cancelled: "This order has been cancelled",
    };
    return descriptions[status] || "Order status updated";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header cartItemCount={0} onCartClick={() => {}} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          <h1 className="text-4xl font-black text-gray-900 mb-8" data-testid="orders-title">
            My Orders
          </h1>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16" data-testid="no-orders">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-shopping-bag text-orange-500 text-3xl"></i>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">No orders yet</h3>
              <p className="text-gray-600 mb-6 text-lg">When you place orders, they'll appear here</p>
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                data-testid="browse-products-link"
              >
                Browse Products →
              </a>
            </div>
          ) : (
            <div className="space-y-6" data-testid="orders-list">
              {orders.map((order: OrderWithItems) => (
                <Card key={order.id} data-testid={`order-card-${order.id}`} className="border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-black text-gray-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        {getOrderStatusBadge(order.status)}
                        <p className="text-sm text-gray-600">
                          {getOrderStatusDescription(order.status)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-600">
                              ₹{item.unitPrice} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-orange-600">
                            ₹{Number(item.unitPrice) * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Delivery Address</p>
                          <p className="font-bold text-gray-900">
                            {order.hostelBlock}, Room {order.roomNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            Phone: {order.phoneNumber}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Payment</p>
                          <p className="font-bold text-gray-900">
                            {order.paymentMethod.toUpperCase()}
                          </p>
                          <Badge 
                            variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                            className="mt-2"
                          >
                            {order.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xl font-black border-t border-gray-200 pt-4">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-orange-600">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Order Progress */}
                    {order.status !== 'cancelled' && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                        <div className="flex items-center space-x-2 mb-4">
                          <i className="fas fa-clock text-orange-500 text-lg"></i>
                          <span className="text-lg font-bold text-gray-900">
                            Order Progress
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center space-x-2 ${
                            ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status)
                              ? 'text-orange-600' : 'text-gray-400'
                          }`}>
                            <i className="fas fa-check-circle text-lg"></i>
                            <span className="text-sm font-medium">Confirmed</span>
                          </div>
                          <div className={`w-8 h-0.5 ${
                            ['preparing', 'ready', 'delivered'].includes(order.status)
                              ? 'bg-orange-500' : 'bg-gray-200'
                          }`}></div>
                          <div className={`flex items-center space-x-2 ${
                            ['preparing', 'ready', 'delivered'].includes(order.status)
                              ? 'text-orange-600' : 'text-gray-400'
                          }`}>
                            <i className="fas fa-utensils text-lg"></i>
                            <span className="text-sm font-medium">Preparing</span>
                          </div>
                          <div className={`w-8 h-0.5 ${
                            ['ready', 'delivered'].includes(order.status)
                              ? 'bg-orange-500' : 'bg-gray-200'
                          }`}></div>
                          <div className={`flex items-center space-x-2 ${
                            ['delivered'].includes(order.status)
                              ? 'text-orange-600' : 'text-gray-400'
                          }`}>
                            <i className="fas fa-shipping-fast text-lg"></i>
                            <span className="text-sm font-medium">Delivered</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
