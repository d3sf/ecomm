import React from 'react';
import { theme, withOpacity } from '@/lib/theme';

export const metadata = {
      title: 'Privacy Policy | Merugo',
  description: 'Our commitment to protecting your privacy and personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: theme.dark }}
        >
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-gray-700">
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Name and contact information</li>
              <li>Billing and shipping address</li>
              <li>Payment information</li>
              <li>Order history</li>
              <li>Account preferences</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              2. How We Use Your Information
            </h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Process your orders and payments</li>
              <li>Communicate with you about your orders</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              3. Information Sharing
            </h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Service providers who assist in our operations</li>
              <li>Payment processors for secure transactions</li>
              <li>Shipping partners to deliver your orders</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              4. Your Rights
            </h2>
            <p className="mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>File a complaint with supervisory authorities</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              5. Security
            </h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              6. Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-white rounded-lg p-4 border" style={{ borderColor: withOpacity(theme.primary, 0.1) }}>
              <p className="mb-2">
                Email: privacy@merugo.com
              </p>
              <p className="mb-2">
                Phone: +1 (555) 123-4567
              </p>
              <p>
                Address: 123 Commerce Street, Business City, BC 12345
              </p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              7. Updates to This Policy
            </h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
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