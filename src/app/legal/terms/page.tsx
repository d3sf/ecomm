import React from 'react';
import { theme } from '@/lib/theme';

export const metadata = {
  title: 'Terms and Conditions | Merugo',
  description: 'Terms and conditions for using Merugo services.',
};

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: theme.dark }}
        >
          Terms and Conditions
        </h1>
        
        <div className="space-y-8 text-gray-700">
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By accessing and using Merugo, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              2. Account Registration
            </h2>
            <p className="mb-4">
              To use certain features of our service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              3. Product Information
            </h2>
            <p className="mb-4">
              We strive to display accurate product information, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Product descriptions</li>
              <li>Pricing</li>
              <li>Availability</li>
              <li>Images</li>
            </ul>
            <p className="mb-4">
              However, we do not guarantee the accuracy of all information and reserve the right to correct any errors.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              4. Pricing and Payment
            </h2>
            <p className="mb-4">
              All prices are in the currency specified and include applicable taxes. We reserve the right to change prices at any time. Payment must be made in full before order processing.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              5. Shipping and Delivery
            </h2>
            <p className="mb-4">
              Shipping times and costs are estimates only. We are not responsible for delays beyond our control. Risk of loss and title for items purchased pass to you upon delivery.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              6. Intellectual Property
            </h2>
            <p className="mb-4">
              All content on this website, including text, graphics, logos, and software, is the property of Merugo and is protected by intellectual property laws.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              7. Limitation of Liability
            </h2>
            <p className="mb-4">
              Merugo shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              8. Governing Law
            </h2>
            <p className="mb-4">
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Merugo operates.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              9. Changes to Terms
            </h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.
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