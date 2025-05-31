import React from 'react';
import { theme } from '@/lib/theme';

export const metadata = {
  title: 'Shipping Policy | Merugo',
  description: 'Our shipping policy and delivery information.',
};

export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: theme.dark }}
        >
          Shipping Policy
        </h1>
        
        <div className="space-y-8 text-gray-700">
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Processing Time
            </h2>
            <p className="mb-4">
              Orders are typically processed within 1-2 business days after payment confirmation. During peak seasons, processing may take longer. You will receive an email confirmation once your order has been processed.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Shipping Methods
            </h2>
            <p className="mb-4">We offer the following shipping options:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Standard Shipping (3-5 business days)</li>
              <li>Express Shipping (1-2 business days)</li>
              <li>Overnight Shipping (next business day)</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Shipping Costs
            </h2>
            <p className="mb-4">
              Shipping costs are calculated based on:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Package weight and dimensions</li>
              <li>Destination address</li>
              <li>Selected shipping method</li>
              <li>Free shipping on orders over $50</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              International Shipping
            </h2>
            <p className="mb-4">
              For international orders:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Additional customs fees may apply</li>
              <li>Delivery times vary by country</li>
              <li>Import duties are the responsibility of the customer</li>
              <li>Some items may be restricted in certain countries</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Order Tracking
            </h2>
            <p className="mb-4">
              Once your order ships, you will receive:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>A shipping confirmation email</li>
              <li>Tracking number</li>
              <li>Estimated delivery date</li>
              <li>Link to track your package</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Delivery Issues
            </h2>
            <p className="mb-4">
              If you experience any issues with delivery:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Contact our customer service team</li>
              <li>Provide your order number and tracking information</li>
              <li>Claims must be filed within 30 days of shipment</li>
              <li>We will assist in resolving any delivery problems</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Shipping Restrictions
            </h2>
            <p className="mb-4">
              Some items may have shipping restrictions:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Hazardous materials</li>
              <li>Perishable items</li>
              <li>Items requiring special handling</li>
              <li>Restricted by local regulations</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Contact Us
            </h2>
            <p className="mb-4">
              For any shipping-related inquiries, please contact us at:
            </p>
            <div className="bg-white border rounded-lg p-4">
              <p className="mb-2">Email: shipping@merugo.com</p>
              <p className="mb-2">Phone: +1 (555) 123-4567</p>
              <p>Hours: Monday - Friday, 9:00 AM - 5:00 PM EST</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Policy Updates
            </h2>
            <p className="mb-4">
              We reserve the right to modify this shipping policy at any time. Changes will be effective immediately upon posting to the website.
            </p>
            <p className="text-sm text-gray-500">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 