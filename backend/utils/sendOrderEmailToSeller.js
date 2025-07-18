// utils/sendOrderEmailToSeller.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // π.χ. myapp@gmail.com
    pass: process.env.EMAIL_PASS        // Gmail App Password
  },
    tls: {
    rejectUnauthorized: false // ⚠️ Accept self-signed certs
  }
});

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
    <div style="font-family: Arial, sans-serif;">
      <h2>🛒 Νέα Παραγγελία για το κατάστημά σας: <strong>${storeName}</strong></h2>
      <p><strong>Αριθμός Παραγγελίας:</strong> ${orderId}</p>
      <p><strong>Ημερομηνία:</strong> ${createdAt}</p>
      <h3>📦 Περιεχόμενα:</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th>Προϊόν</th>
            <th>Ποσότητα</th>
            <th>Τιμή</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.title}</td>
              <td>${item.quantity}</td>
              <td>${item.price.toFixed(2)}€</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <h3>💰 Συνολικό Ποσό: ${parseFloat(totalCost)}€</h3>
      <h3>👤 Πληροφορίες Πελάτη:</h3>
      <ul>
        <li>Όνομα: ${customerInfo.username}</li>
        <li>Περιοχή: ${customerInfo.region || '-'}</li>
        <li>Τ.Κ.: ${customerInfo.postalCode || '-'}</li>
        <li>Διεύθυνση: ${customerInfo.address || '-'}</li>
        <li>Όροφος: ${customerInfo.floor || '-'}</li>
        <li>Κουδούνι: ${customerInfo.doorbell || '-'}</li>
        <li>Κινητό: ${customerInfo.mobile || '-'}</li>
      </ul>
      ${customerInfo.comment ? `<h4>📝 Σχόλιο Πελάτη:</h4><p>${customerInfo.comment}</p>` : ''}
    </div>
  `;

  await transporter.sendMail({
    from: `"FD.App Παραγγελίες" <${process.env.EMAIL_USER}>`,
    to: sellerEmail,
    subject: `Νέα Παραγγελία στο κατάστημα ${storeName}`,
    html,
  });
};

export default sendOrderEmailToSeller;
