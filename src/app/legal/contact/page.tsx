import React from 'react';
import { theme } from '@/lib/theme';

export const metadata = {
  title: 'Contact Us | Merugo',
  description: 'Get in touch with Merugo customer service.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: theme.dark }}
        >
          Contact Us
        </h1>
        
        <div className="space-y-8 text-gray-700">
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Customer Service
            </h2>
            <div className="bg-white border rounded-lg p-4">
              <p className="mb-2">Email: support@merugo.com</p>
              <p className="mb-2">Phone: +1 (555) 123-4567</p>
              <p>Hours: Monday - Friday, 9:00 AM - 5:00 PM EST</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Returns & Refunds
            </h2>
            <div className="bg-white border rounded-lg p-4">
              <p className="mb-2">Email: returns@merugo.com</p>
              <p className="mb-2">Phone: +1 (555) 123-4568</p>
              <p>Hours: Monday - Friday, 9:00 AM - 5:00 PM EST</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Business Inquiries
            </h2>
            <div className="bg-white border rounded-lg p-4">
              <p className="mb-2">Email: business@merugo.com</p>
              <p className="mb-2">Phone: +1 (555) 123-4569</p>
              <p>Hours: Monday - Friday, 9:00 AM - 5:00 PM EST</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Contact Form
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.primary }}
              >
                Send Message
              </button>
            </form>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Office Location
            </h2>
            <div className="bg-white border rounded-lg p-4">
              <p className="mb-2">Merugo Headquarters</p>
              <p className="mb-2">123 Business Street</p>
              <p className="mb-2">Suite 100</p>
              <p>New York, NY 10001</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Store Hours
            </h2>
            <div className="bg-white border rounded-lg p-4">
              <p className="mb-2">Monday - Friday: 9:00 AM - 5:00 PM EST</p>
              <p className="mb-2">Saturday: 10:00 AM - 4:00 PM EST</p>
              <p>Sunday: Closed</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: theme.primary }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">How do I track my order?</h3>
                <p>You can track your order by logging into your account and visiting the order details page, or by using the tracking number provided in your shipping confirmation email.</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">What is your return policy?</h3>
                <p>We accept returns within 30 days of delivery. Items must be unused and in original packaging. Please visit our Returns & Refunds page for more details.</p>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">How can I change or cancel my order?</h3>
                <p>Orders can be modified or cancelled within 1 hour of placement. Please contact our customer service team immediately for assistance.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 