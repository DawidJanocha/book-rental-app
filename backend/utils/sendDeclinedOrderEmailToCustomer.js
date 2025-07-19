import nodemailer from 'nodemailer';

const sendDeclinedOrderEmailToCustomer = async ({
  customerEmail,
  username,
  storeName,
  orderId,
  deliveryTime,
  items,
  customerInfo,
  totalCost,

}) => {
  try {
    if (!totalCost) {
      totalCost = items.reduce((sum, item) => {
        const price = typeof item.price === 'object' && item.price.$numberDecimal
          ? parseFloat(item.price.$numberDecimal)
          : parseFloat(item.price);

        return sum + item.quantity * price;
      }, 0).toFixed(2);
    }
    // 👉 Δημιουργία transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
          tls: {
              rejectUnauthorized: false // ⚠️ Accept self-signed certs
        }
    });

    // 👉 Δημιουργία HTML περιεχομένου
    const itemsTable = items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">${item.title}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${item.price} €</td>
      </tr>
    `).join('');

    const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 24px; color: #333;">
  <div style="background-color: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">

    <h2 style="color: #d32f2f;">❌ Η παραγγελία σου απορρίφθηκε</h2>
    <p style="font-size: 16px; margin-bottom: 8px;">
      Αγαπητέ/ή <strong>${username}</strong>, η παραγγελία σου στο κατάστημα <strong>${storeName}</strong> δεν έγινε αποδεκτή.
    </p>
    <p style="font-size: 14px; margin-bottom: 24px;">📞 Μπορείς να επικοινωνήσεις απευθείας με το κατάστημα. Για περισσότερες πληροφορίες.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

    <p><strong>🆔 Κωδικός Παραγγελίας:</strong> ${orderId}</p>

    <h3 style="margin-top: 24px; color: #333;">🧾 Περιεχόμενο Παραγγελίας</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 8px; border: 1px solid #ccc;">Προϊόν</th>
          <th style="padding: 8px; border: 1px solid #ccc;">Ποσότητα</th>
          <th style="padding: 8px; border: 1px solid #ccc;">Τιμή</th>
        </tr>
      </thead>
      <tbody>
        ${itemsTable}
      </tbody>
    </table>

    <h3 style="margin-top: 24px;">🚚 Πληροφορίες Παράδοσης</h3>
    <p><strong>Διεύθυνση:</strong> ${customerInfo.street}, ${customerInfo.region}, ${customerInfo.postalCode}</p>
    <p><strong>Όροφος:</strong> ${customerInfo.floor} | <strong>Κουδούνι:</strong> ${customerInfo.doorbell}</p>
    <p><strong>Κινητό Τηλέφωνο:</strong> ${customerInfo.phone}</p>

    <h3 style="margin-top: 24px;">💰 Συνολικό Κόστος</h3>
    <p style="font-size: 18px; font-weight: bold;">${totalCost} €</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 13px; color: #777;">
      Ευχαριστούμε που χρησιμοποιείς την υπηρεσία μας.<br>
      — Η ομάδα του B.D.App
    </p>
  </div>
</div>

    `;

    // 👉 Αποστολή email
    await transporter.sendMail({
      from: `"Book Delivery App" <${process.env.EMAIL_USERNAME}>`,
      to: customerEmail,
      subject: `Η παραγγελία σου επιβεβαιώθηκε από το κατάστημα ${storeName}`,
      html,
    });

    console.log(`✅ Email αποστάλθηκε στον πελάτη: ${customerEmail}`);
  } catch (err) {
    console.error('❌ Αποτυχία αποστολής email στον πελάτη:', err);
  }
};

export default sendDeclinedOrderEmailToCustomer;
