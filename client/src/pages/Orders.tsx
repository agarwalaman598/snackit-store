import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderWithItems } from "@shared/schema";

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
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
          <h1 className="text-3xl font-bold text-charcoal mb-8" data-testid="orders-title">
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
            <div className="text-center py-12" data-testid="no-orders">
              <div className="w-16 h-16 bg-gray-light rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shopping-bag text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-charcoal mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">When you place orders, they'll appear here</p>
              <a 
                href="/" 
                className="text-primary hover:text-primary-dark font-medium"
                data-testid="browse-products-link"
              >
                Browse Products →
              </a>
            </div>
          ) : (
            <div className="space-y-6" data-testid="orders-list">
              {orders.map((order: OrderWithItems) => (
                <Card key={order.id} data-testid={`order-card-${order.id}`}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
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
                  <CardContent>
                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-charcoal">{item.product.name}</p>
                            <p className="text-sm text-gray-600">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            ₹{Number(item.price) * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Delivery Address</p>
                          <p className="font-medium">
                            {order.hostelBlock}, Room {order.roomNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            Phone: {order.phoneNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment</p>
                          <p className="font-medium">
                            {order.paymentMethod.toUpperCase()}
                          </p>
                          <Badge 
                            variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                            className="mt-1"
                          >
                            {order.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                        <span>Total Amount:</span>
                        <span className="text-primary">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Order Progress */}
                    {order.status !== 'cancelled' && (
                      <div className="mt-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <i className="fas fa-clock text-primary"></i>
                          <span className="text-sm font-medium text-charcoal">
                            Order Progress
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center space-x-2 ${
                            ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status)
                              ? 'text-primary' : 'text-gray-400'
                          }`}>
                            <i className="fas fa-check-circle"></i>
                            <span className="text-sm">Confirmed</span>
                          </div>
                          <div className={`w-8 h-0.5 ${
                            ['preparing', 'ready', 'delivered'].includes(order.status)
                              ? 'bg-primary' : 'bg-gray-200'
                          }`}></div>
                          <div className={`flex items-center space-x-2 ${
                            ['preparing', 'ready', 'delivered'].includes(order.status)
                              ? 'text-primary' : 'text-gray-400'
                          }`}>
                            <i className="fas fa-utensils"></i>
                            <span className="text-sm">Preparing</span>
                          </div>
                          <div className={`w-8 h-0.5 ${
                            ['ready', 'delivered'].includes(order.status)
                              ? 'bg-primary' : 'bg-gray-200'
                          }`}></div>
                          <div className={`flex items-center space-x-2 ${
                            ['delivered'].includes(order.status)
                              ? 'text-primary' : 'text-gray-400'
                          }`}>
                            <i className="fas fa-shipping-fast"></i>
                            <span className="text-sm">Delivered</span>
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
