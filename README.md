Credits
Created by Dawid Janocha 

---

# 📚 E-Book Platform App

The **E-Book Platform App** is a modern web platform where customers and sellers communicate and transact around books. It supports browsing, ordering, dashboard analytics, role-based access, secure authentication, real-time notifications, and admin oversight.

---

## 🔧 Technologies Used

- **Frontend**: React.js (v19), TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT-based
- **Email System**: Nodemailer with Gmail App Password
- **Order Flow**: Custom logic with multi-user notifications
- **State Management**: Context API + LocalStorage

---

## 👥 User Roles

### 1. Customer
- Register with full address and contact info
- Browse and buy books
- View order history
- Receive confirmation emails when orders are accepted

### 2. Partner
- Register with or without a store
- Add/edit/delete books from their store
- Bulk import books via Excel or JSON
- View and manage orders from customers
- Accept orders and define delivery estimate

### 3. Admin
- Full platform oversight  
- View aggregate and per-store statistics  
- Manage users (customers, sellers)  
- Monitor orders and disputes  
- Access and audit communication logs  

---

## 🧩 Core Features


- Responsive UI with filters and dashboards
- - Dynamic product listing with filters, pagination, and infinite scroll (mobile)
- JWT-secured auth with automatic global logout on server restart  
- Password reset via secure emailed link  
- Role-based dashboards (Customer, Seller, Admin)
- - Authenticated cart system with localStorage sync
- Communication form between customer and seller for order-related messaging  
- Email notifications for order lifecycle events / order confirmation / password change / communication form/ Registration Confirmation  
- Analytics: revenue, top sellers, regional breakdowns  
- JWT-secured backend with role-based authorization

---

## 🔄 Order Flow

1. Customer adds books to cart and completes order
2. Seller/'s receives email with order details
3. Seller/'s accepts the order and sets estimated time of  collection (15m–3h)
4. Customer receives confirmation email with order summary and estimated time

---

## 📦 Project Structure

```
/frontend
  └── src
       ├── components/
       ├── pages/
       ├── context/
       └── utils/axiosInstance.js

/backend
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  └── utils/
```

---

## 🔐 Authentication

- Modal-based login/register system (no redirects)
- Customer after registration includes:
  - Phone number, region, floor, doorbell, full address
- Seller after registration includes store MongoDb Creation :
  - Full store info (name, VAT, address, region, phone, email)
- Role-based logic with redirect routing post-login

---

## 📊 Dashboard Statistics

- Live data for:
  - Total Orders
  - Total Books Rented
  - Revenue in €
  - Last book rented + value
- Best Seller Pie Chart
- Top seller card
- Book and order metrics grouped by partner

---

## 📩 Email System

- Triggered on:
  - User (Customer/Seller) Registration (confirmation  Email)
  - Order completion (sent to customer)
  - Order acceptance (sent to seller)
  - Contact-form
  - Reset Password
- Custom HTML templates on every event
- Displays: order items, prices, total, delivery info

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/your-username/eBooks-App.git

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend & frontend
cd backend && npm run dev
cd ../frontend && npm start

To start the server you need to
npm run dev in the Final Project 
*npm run dev runs backend and frontend with 1 command 
```

---

## 🧪 Testing

- Manual testing with Postman and browser

---

## 🛡️ Security

- Protected routes using JWT and role checks
- Seller-only access to seller Dashboard (Edit & Add & Delete -> product, Tab for (accpet or decline order), store Statistics)
- Email verification required on registration

---

## ✍️ Author

> This project was developed as a final project for the **Coding Factory 7 - University of Piraeus**.  
> Frontend, backend, UI, dashboard logic and deployment were developed from scratch.  
> Developer: **[Your Full Name]**  

---
