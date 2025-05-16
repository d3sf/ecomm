"use client";

import { useState, useEffect } from 'react';
import { Package, Clock, Truck, ShoppingBag } from 'lucide-react';
import { DashboardCardsSkeleton } from './skeletons';

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
}

export default function DashboardCards() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <DashboardCardsSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const cards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: <ShoppingBag className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      title: 'Orders Pending',
      value: stats?.pendingOrders || 0,
      icon: <Clock className="h-8 w-8 text-yellow-500" />,
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Orders Processing',
      value: stats?.processingOrders || 0,
      icon: <Package className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700'
    },
    {
      title: 'Orders Delivered',
      value: stats?.deliveredOrders || 0,
      icon: <Truck className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`${card.color} border p-6 rounded-lg shadow-sm transition-transform duration-300 hover:shadow-md hover:-translate-y-1`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-white shadow-sm">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 