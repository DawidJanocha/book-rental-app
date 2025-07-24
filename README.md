Credits
Created by Dawid Janocha 

---

# 📚 Book Rental App

The **Book Rental App** is a modern web platform that allows users to browse, rent, and manage books online. Designed for seamless collaboration between bookstores (partners) and customers, the application offers a complete order and inventory management system, sales statistics, and real-time email notifications.

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
- Browse and rent books
- View order history
- Receive confirmation emails when orders are accepted

### 2. Partner
- Register with or without a store
- Add/edit/delete books from their store
- Bulk import books via Excel or JSON
- View and manage orders from customers
- Accept orders and define delivery estimate

---

## 🧩 Core Features

- Fully responsive UI
- Dynamic product listing with filters, pagination, and infinite scroll (mobile)
- Authenticated cart system with localStorage sync
- Store management (creation, editing, region selection, contact info)
- Partner dashboard with:
  - Product management
  - Sales statistics (revenue, total orders, top sellers)
  - Order confirmation & notification system
  - Duplicate product detection & removal
- Email templates for order notifications (customer, partner, admin)
- JWT-secured backend with role-based authorization

---

## 🔄 Order Flow

1. Customer adds books to cart and completes order
2. Partner receives email with order details
3. Partner accepts the order and sets delivery estimate (15m–1h)
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
- Customer registration includes:
  - Phone number, region, floor, doorbell, full address
- Partner registration includes:
  - Option to create a store on signup
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
  - Order completion (sent to partner)
  - Order acceptance (sent to customer)
- Custom HTML templates
- Displays: order items, prices, total, delivery info

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/your-username/book-rental-app.git

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend & frontend
cd backend && npm run dev
cd ../frontend && npm start
```

---

## 🧪 Testing

- Manual testing with Postman and browser
- Unit testing (Jest) in progress for:
  - Order routes
  - Auth controller
  - Partner dashboard endpoints

---

## 🛡️ Security

- Protected routes using JWT and role checks
- Partner-only access to dashboard, product & order management
- Email verification required on registration

---

## ✍️ Author

> This project was developed as a final project for the **Coding Factory 7 - University of Piraeus**.  
> Frontend, backend, UI, dashboard logic and deployment were developed from scratch.  
> Developer: **[Your Full Name]**  

---
