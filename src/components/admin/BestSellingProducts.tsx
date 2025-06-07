"use client";

import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Image from 'next/image';
import { BestSellingProductsSkeleton } from './skeletons';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BestSellingProduct {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface DashboardData {
  bestSellingProducts: BestSellingProduct[];
  [key: string]: unknown;
}

export default function BestSellingProducts() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching best selling products:', error);
        setError('Failed to load best selling products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <BestSellingProductsSkeleton />;
  }

  if (error || !data?.bestSellingProducts?.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Best Selling Products</h3>
        <div className="text-center py-8 text-gray-500">
          {error || "No sales data available yet."}
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: data.bestSellingProducts.map(product => product.name.length > 15 
      ? product.name.substring(0, 15) + '...' 
      : product.name),
    datasets: [
      {
        label: 'Units Sold',
        data: data.bestSellingProducts.map(product => product.quantity),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Best Selling Products',
        font: {
          size: 16,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units Sold'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Products'
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Best Selling Products</h3>
      
      <div className="h-72">
        <Bar data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Product Details</h4>
        <div className="grid gap-3">
          {data.bestSellingProducts.map((product) => (
            <div key={product.id} className="flex items-center border-b pb-2">
              <div className="w-16 h-16 relative mr-3 rounded-md overflow-hidden flex-shrink-0 border border-black">
                {typeof product.image === 'string' && product.image.length > 0 ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 64px) 100vw, 64px"
                    className="object-contain"
                    style={{ padding: '4px' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Image
                      src="/placeholder.png"
                      alt="No image"
                      fill
                      sizes="(max-width: 64px) 100vw, 64px"
                      className="object-contain"
                      style={{ padding: '4px' }}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-500">
                  ₹{product.price.toFixed(2)} · {product.quantity} sold
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 