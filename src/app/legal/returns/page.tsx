import React from 'react';
import { theme } from '@/lib/theme';

export const metadata = {
  title: 'Returns and Refunds Policy | Merugo',
  description: 'Our returns and refunds policy for Merugo products.',
};

export default function ReturnsPolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: theme.dark }}
        >
          Returns and Refunds Policy
        </h1>
        
        <div className="space-y-8 text-gray-700">
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Return Policy
            </h2>
            <p className="mb-4">
              We accept returns within 30 days of delivery. To be eligible for a return, your item must be:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Unused and in the same condition as received</li>
              <li>In the original packaging</li>
              <li>Accompanied by the receipt or proof of purchase</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Return Process
            </h2>
            <p className="mb-4">To initiate a return:</p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Contact our customer service team</li>
              <li>Provide your order number and reason for return</li>
              <li>Follow the shipping instructions provided</li>
              <li>Include all original packaging and accessories</li>
            </ol>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Refund Process
            </h2>
            <p className="mb-4">
              Once we receive your return:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We will inspect the item within 2-3 business days</li>
              <li>If approved, your refund will be processed</li>
              <li>Refunds are issued to the original payment method</li>
              <li>Processing time may vary depending on your payment provider</li>
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
              Return shipping costs are the responsibility of the customer unless the return is due to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Defective or damaged items</li>
              <li>Incorrect items received</li>
              <li>Our error in processing your order</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Exchanges
            </h2>
            <p className="mb-4">
              To exchange an item:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>Follow the return process above</li>
              <li>Note your desired exchange item in the return form</li>
              <li>Additional charges may apply for price differences</li>
            </ol>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Non-Returnable Items
            </h2>
            <p className="mb-4">
              The following items cannot be returned:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Final sale items</li>
              <li>Personalized or custom-made products</li>
              <li>Items marked as non-returnable</li>
              <li>Used or damaged items</li>
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
              For any questions about our returns policy, please contact us at:
            </p>
            <div className="bg-white border rounded-lg p-4">
              <p className="mb-2">Email: returns@merugo.com</p>
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
              We reserve the right to modify this returns policy at any time. Changes will be effective immediately upon posting to the website.
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