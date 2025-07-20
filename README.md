Credits
Created by Dawid Janocha 

---

# Book Rental Ap

A full-stack web application for renting books online. Users can browse books from multiple Sellers stores, add them to a cart, place orders, and receive email confirmations. Sellers can manage their book inventory and confirm incoming orders.

---

##  Features

###  Customers
-  Browse and search available books by title or store
-  Add books to a shopping cart
-  Place an order and receive email confirmation
-  Secure login and registration
-  View order history
- add/change customer details
- change password

###  Sellers
-  Register as a Seller with optional store details
-  Add / edit / delete books
-  Receive order emails only for their own books
-  Bulk import books (JSON / Excel supported)
- View the store order's History by orderId

###  Admin (optional future expansion)
- Monitor all orders and users
- Manage users and stores

---

## ⚙️ Tech Stack

### Frontend
- **React** with Context API
- **Tailwind CSS** for styling
- **React Router** for routing

### Backend
- **Node.js + Express**
- **MongoDB** with Mongoose
- **JWT Authentication**
- **Nodemailer** for emails
- **Multer + XLSX** for file uploads

---

 Frontend Setup
 
```bash
Copy
Edit
cd frontend
npm install
npm start
```
---

✉ Email Notifications
The app supports:

Order confirmation emails to customers

Order alert emails to each seller (per store)

Store-specific logic ensures each seller receives only their portion

---

 Folder Structure
css
Copy
Edit
backend/
  routes/
  controllers/
  models/
  utils/
  ...
frontend/
  src/
    pages/
    components/
    context/
    utils/
    
---

##  Installation

###  Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Fill in your MongoDB, Email credentials, JWT_SECRET
npm run dev
```


