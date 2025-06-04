<div style="display: flex; align-items: center; gap: 10px;">
  <!-- <img src="public/merugo-logo.svg" alt="Merugo Logo" width="40" height="40"/> -->
  <!-- <span style="font-size: 2rem; font-weight: bold;">Merugo</span> -->
</div>

## Merugo
---

A modern, full-stack e-commerce platform built with Next.js 13+, Prisma, and TypeScript. Merugo provides a seamless shopping experience with features for customers, admins, and staff, including product browsing, cart management, checkout, and an admin dashboard.

---

## Features
### 🛒 Customer Features
- **Product Browsing:** View products by category, search, and featured sections.
- **Product Details:** Detailed product pages with images, attributes, and related products.
- **Cart:** Add, update, and remove products from the cart. Cart state is persisted.
- **Checkout:** Multi-step checkout with address selection, payment method, and order review.
- **Account Management:** View and manage orders, addresses, and profile information.
- **Order Tracking:** Track order status and download invoices.

### 🛠️ Admin Features
- **Dashboard:** Overview of orders, best-selling products, and quick links to manage store data.
- **Product Management:** Add, edit, and remove products and categories.
- **Order Management:** View and manage customer orders.
- **Customer Management:** View customer details and order history.
- **Staff Management:** Manage staff accounts and permissions.

### 📦 Core Technologies
- **Next.js (App Router, Server Components, Suspense)**
- **Prisma ORM** for database access
- **Redux Toolkit** for cart state management
- **Zod** for schema validation
- **Lucide React** for icons
- **Cloudinary** for image uploads
- **Stripe** (and Razorpay, currently disabled) for payments

---

## Project Structure

```
src/
  app/                # Next.js app directory (pages, API routes, layouts)
    (shop)/           # Main shop routes (home, products, checkout, account, etc.)
    admin/            # Admin dashboard and management routes
    api/              # API endpoints (products, orders, users, etc.)
  components/         # Reusable UI and feature components
  lib/                # Utility libraries (Prisma, validation, theme, etc.)
  store/              # Redux store and slices (cart, etc.)
  contexts/           # React context providers (cart, auth, etc.)
  hooks/              # Custom React hooks
  types/              # TypeScript type definitions
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root with your database, authentication, and third-party service credentials. Example:
```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
CLOUDINARY_URL=your_cloudinary_url
STRIPE_SECRET_KEY=your_stripe_key
```

### 3. Run Database Migrations
```bash
npx prisma migrate dev
```

### 4. Start the Development Server
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Key Components & Pages

- **Home Page:** Product categories, banners, and featured sections.
- **Product Page:** Detailed product info, images, and add to cart.
- **Cart Modal:** Quick cart access and management.
- **Checkout:** Multi-step checkout (address, payment, review).
- **Account:** Orders, addresses, and profile management.
- **Admin Dashboard:** Store overview, quick links, and management tools.


---

## Contributing
Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

---
