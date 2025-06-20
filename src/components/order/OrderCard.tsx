import Image from "next/image";
import { Eye, Download } from "lucide-react";
import { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
  onView: () => void;
  onDownloadInvoice: () => void;
}

export default function OrderCard({ order, onView, onDownloadInvoice }: OrderCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-medium">Order #{order.id}</p>
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
      <div className="space-y-2">
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
          </div>
        ))}
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <p className="text-sm text-gray-500 mb-1 sm:mb-0">Shipping Address:</p>
          <div className="text-sm">
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-1 sm:mb-0">Total Amount:</p>
          <div className="flex items-center gap-4">
            <p className="font-medium">₹{order.totalAmount}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={onView}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              <button
                onClick={onDownloadInvoice}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="h-4 w-4 mr-1" />
                Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 