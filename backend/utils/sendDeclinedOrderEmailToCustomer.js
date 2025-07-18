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
      <div style="font-family: Arial, sans-serif;">
        <h2>Ευχαριστούμε ${username} που προτιμήσατε το κατάστημα ${storeName} DECLINEEED!</h2>
        <p><strong>Κωδικός παραγγελίας:</strong> ${orderId}</p>
        <p><strong>Geia sas:</strong> ${deliveryTime}</p>
        
        <h3>🧾 Περιεχόμενο παραγγελίας</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #ccc;">Προϊόν</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Ποσότητα</th>
              <th style="padding: 8px; border: 1px solid #ccc;">Τιμή</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTable}
          </tbody>
        </table>

        <h3>🚚 Πληροφορίες Παράδοσης</h3>
        <p><strong>Διεύθυνση:</strong> ${customerInfo.street}, ${customerInfo.region}, ${customerInfo.postalCode}</p>
        <p><strong>Όροφος:</strong> ${customerInfo.floor} | <strong>Κουδούνι:</strong> ${customerInfo.doorbell}</p>
        <p><strong>Κινητό Τηλέφωνο:</strong> ${customerInfo.phone}</p>

        <h3>💰 Συνολικό Κόστος: ${totalCost} €</h3>

        <p>Θα ειδοποιηθείτε όταν ο διανομέας είναι καθ’ οδόν. Καλή σας όρεξη!</p>
      </div>
    `;

    // 👉 Αποστολή email
    await transporter.sendMail({
      from: `"F.D.App" <${process.env.EMAIL_USERNAME}>`,
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
