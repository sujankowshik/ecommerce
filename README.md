# Antigravity | Full-Stack eCommerce Store & Admin Dashboard

Welcome to **Antigravity**, a modern, visually stunning, fully responsive, and production-ready Full-Stack eCommerce platform built using the MERN stack and industry-standard security best practices. Suitable for Software Engineering Internship showcases and high-performance production setups.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Fluid Catalog Shop**: Paginated grid layouts, keywords text search, category anchors, and price range filters.
- **Star Review System**: Authentic 1-to-5 star customer ratings with unique indexes restricting duplicate reviews.
- **Wishlist Syncing**: Save favorite items instantly, cached in MongoDB for authenticated accounts.
- **Adaptive Shopping Cart**: Live quantity increments, estimated tax/shipping rates, and coupon discount validation.
- **Multi-Gateway Checkout**: Stripe Elements Card Fields + PayPal Smart Payment Sandbox captures.
- **Visual Receipt & Tracking**: Automated delivery tracking milestones (Processed → In Transit → Delivered).
- **Responsive Dark Mode**: Smooth class transitions stored in local storage.

### 📊 Administrative Dashboard
- **Analytics Overview**: Financial cards (Total Revenue, Orders, Products, Customers) + dynamic Recharts graphs.
- **Product CRUD Panel**: Add, edit, or delete items. Features multi-image upload streams piped to Cloudinary.
- **Category CRUD Panel**: Create, list, and purge catalog category slugs.
- **Order Fulfillments**: Track customers checkouts and toggle tracking states (Ship / Deliver buttons).
- **Customers Contribution logs**: Aggregate users contributions and exact spending histories.
- **Coupon Configurations**: Provision uppercase discount codes (Percentage or Flat Dollar) with expiry dates.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS v3, Recharts, Lucide Icons, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, JWT, Multer
- **Database**: MongoDB Mongoose
- **Authentication**: Firebase Authentication Client SDK + Admin SDK Token Verification
- **Payment Gateways**: Stripe Elements JS SDK, PayPal JS REST APIs
- **Image Storage**: Cloudinary Node.js SDK
- **Security**: Helmet, Express Rate Limiter, Protected RBAC Middlewares

---

## 📦 Project Structure

```
ecommerce/
├── backend/
│   ├── config/             # DB, Firebase Admin, and Cloudinary setups
│   ├── controllers/        # Core business controller routines
│   ├── middleware/         # JWT verify, RBAC checks, Multer uploads
│   ├── models/             # Mongoose schemas (Users, Products, Orders...)
│   ├── routes/             # Express API routing endpoints
│   ├── utils/              # Seeder, test script, and token generator
│   ├── server.js           # Server bootstrap
│   └── package.json
├── frontend/
│   ├── public/             # Icons and public assets
│   ├── src/
│   │   ├── components/     # Reusable layout fragments, Skeletons, Rating
│   │   ├── context/        # Theme, Cart, and Auth Context API stores
│   │   ├── pages/          # Catalog views, checkout, dashboard, admin
│   │   ├── services/       # Axios API client with auto JWT inject
│   │   ├── firebase.js     # Unified Client Auth SDK / Simulator
│   │   ├── App.jsx         # App routing mapping
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## ⚙️ Initial Local Setup

### 1. Database & Package Installations
Ensure you have **Node.js (v18+)** and **MongoDB** installed and running locally.

```bash
# Clone the repository and navigate inside
cd ecommerce

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables Configuration
Duplicate `.env.example` in both folders and rename them to `.env`.

#### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_long_secure_jwt_secret_key
# Set up Firebase Admin certification, Stripe secrets, Cloudinary keys, etc.
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
# Add client Firebase public credentials and PayPal Client IDs
```

> [!NOTE]
> **No Credentials? No Problem!**
> If you leave the `.env` credentials empty, both the frontend and backend will **automatically activate the Developer Simulators**. You can test email login, Google OAuth, Stripe card checkouts, PayPal captures, and Cloudinary uploads entirely offline inside a mock sandbox!

---

## ⚡ Running the Application

### 1. Database Seeding (Required on First Run)
Populate standard premium products, category assets, and test coupons into your MongoDB:
```bash
cd backend
npm run seed
```

### 2. Booting both Servers
Run the backend Express server:
```bash
cd backend
npm run dev
```

Run the frontend Vite React server:
```bash
cd ../frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Isolated Verification Testing

To execute the automated API integration test suite (authentications, role locks, analytics aggregates):
```bash
cd backend
node utils/test-api.js
```
The script will spin up a clean MongoDB test sandbox, execute all test scenarios, assert results, and terminate securely with a 100% success status!
