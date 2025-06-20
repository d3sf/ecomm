import Image from "next/image";
import { ArrowLeft, Download } from "lucide-react";
import { Order } from "@/types/order";

interface OrderDetailsViewProps {
  order: Order;
  onBack: () => void;
  onDownloadInvoice: () => void;
}

export default function OrderDetailsView({ order, onBack, onDownloadInvoice }: OrderDetailsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </button>
        <button
          onClick={onDownloadInvoice}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-4 w-4 mr-1" />
          Download Invoice
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">Order #{order.id}</h2>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded text-sm ${
              order.status === "DELIVERED"
                ? "bg-green-100 text-green-800"
                : order.status === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4"
                >
                  <div className="w-16 h-16 relative flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={item.product.images[0]?.url || "/placeholder.png"}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 64px) 100vw, 64px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-medium">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Amount</span>
              <span className="text-xl font-semibold">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 