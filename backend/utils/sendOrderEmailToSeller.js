// utils/sendOrderEmailToSeller.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


// Ρύθμιση του transporter για την αποστολή email μέσω Gmail
// Χρησιμοποιούμε το nodemailer για να στείλουμε email στον πωλητή
// Το email περιλαμβάνει πληροφορίες για την παραγγελία, υπολογίζει το συνολικό κόστος της παραγγελίας
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       
    pass: process.env.EMAIL_PASS   
  },
    tls: {
    rejectUnauthorized: false // ⚠️ Accept self-signed certs
  }
});
// Έλεγχος αν η σύνδεση με το email είναι επιτυχής
const sendOrderEmailToSeller = async ( {
  sellerEmail,
  storeName,
  items,
  totalCost,
  customerInfo,
  orderId,
  createdAt,
}) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7; padding: 30px; color: #333;">
  <div style="max-width: 700px; margin: auto; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 32px;">

    <!-- Header -->
    <h2 style="color: #1976d2; font-size: 24px;">📚 Νέα Παραγγελία για το κατάστημά σας: <strong>${storeName}</strong></h2>
    <p style="margin-top: 10px; font-size: 15px;">
      <strong>🆔 Κωδικός Παραγγελίας:</strong> ${orderId}<br>
      <strong>📅 Ημερομηνία:</strong> ${createdAt}
    </p>

    <!-- Products Table -->
    <h3 style="margin-top: 30px; font-size: 20px;">📦 Περιεχόμενα</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; border: 1px solid #ddd;">📖 Τίτλος</th>
          <th style="padding: 10px; border: 1px solid #ddd;">📦 Ποσότητα</th>
          <th style="padding: 10px; border: 1px solid #ddd;">💶 Τιμή</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td style="padding: 10px; border: 1px solid #eee;">${item.title}</td>
            <td style="padding: 10px; border: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border: 1px solid #eee;">${item.price.toFixed(2)} €</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Total Cost -->
    <h3 style="margin-top: 30px; font-size: 20px;">💰 Συνολικό Ποσό</h3>
    <p style="font-size: 18px; font-weight: bold; color: #2e7d32;">${parseFloat(totalCost).toFixed(2)} €</p>

    <!-- Customer Info -->
    <h3 style="margin-top: 30px; font-size: 20px;">👤 Στοιχεία Πελάτη</h3>
    <ul style="list-style: none; padding-left: 0; font-size: 15px;">
      <li><strong>Όνομα:</strong> ${customerInfo.username}</li>
      <li><strong>Περιοχή:</strong> ${customerInfo.region || '-'}</li>
      <li><strong>Τ.Κ.:</strong> ${customerInfo.postalCode || '-'}</li>
      <li><strong>Διεύθυνση:</strong> ${customerInfo.address || '-'}</li>
      <li><strong>Όροφος:</strong> ${customerInfo.floor || '-'}</li>
      <li><strong>Κουδούνι:</strong> ${customerInfo.doorbell || '-'}</li>
      <li><strong>Κινητό Τηλέφωνο:</strong> ${customerInfo.mobile || '-'}</li>
    </ul>

    <!-- Optional Comment -->
    ${customerInfo.comment ? `
      <h4 style="margin-top: 24px;">📝 Σχόλιο Πελάτη</h4>
      <p style="font-style: italic; background-color: #fdf3c7; padding: 12px; border-radius: 6px; border: 1px solid #eee;">
        ${customerInfo.comment}
      </p>
    ` : ''}

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <!-- Footer -->
    <p style="font-size: 13px; color: #666; text-align: center;">
      Μπείτε στο <strong>B.D.App</strong> για να επιβεβαιώσετε την παραγγελία.<br>
      — Η ομάδα του Book Delivery App
    </p>

  </div>
</div>

  `;

  await transporter.sendMail({
    from: `"Book Delivery App" <${process.env.EMAIL_USER}>`,
    to: sellerEmail,
    subject: `Νέα Παραγγελία στο κατάστημα ${storeName}`,
    html,
  });
};

export default sendOrderEmailToSeller;
