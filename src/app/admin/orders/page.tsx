// src/app/admin/orders/page.tsx
import OrdersList from './OrdersList';

export default function OrdersPage() {
  return (
    <div className='py-8'>
      <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>
      <OrdersList />
    </div>
  );
}