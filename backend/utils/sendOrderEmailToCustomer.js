import nodemailer from 'nodemailer';


// Αποστολή email σε πελάτη όταν η παραγγελία επιβεβαιώνεται από το κατάστημα
// Περιλαμβάνει πληροφορίες για την παραγγελία, τα προϊόντα και την παράδοση
// Επίσης, υπολογίζει το συνολικό κόστος αν δεν έχει δοθεί
const sendOrderEmailToCustomer = async ({
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
        //  Ελέγχουμε αν το price είναι αριθμός
        return sum + item.quantity * price;
      }, 0).toFixed(2);
    }
    // Δημιουργία transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
          tls: {
    rejectUnauthorized: false // Accept self-signed certs
  }
    });

    //  Δημιουργία HTML περιεχομένου
    const itemsTable = items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">${item.title}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ccc;">${item.price} €</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 30px; color: #333;">
  <div style="max-width: 700px; margin: auto; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 32px;">

    <!-- Header -->
    <h2 style="color: #2e7d32; font-size: 26px; margin-bottom: 12px;">📦 Η παραγγελία σου επιβεβαιώθηκε!</h2>
    <p style="font-size: 16px; line-height: 1.6;">
      Ευχαριστούμε <strong>${username}</strong> που προτιμήσατε το κατάστημα <strong>${storeName}</strong> 📚
    </p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">

    <!-- Order Info -->
    <p style="font-size: 15px;"><strong>🆔 Κωδικός Παραγγελίας:</strong> ${orderId}</p>
    <p style="font-size: 15px;"><strong>⏱️ Εκτιμώμενος χρόνος παράδοσης:</strong> ${deliveryTime}</p>

    <!-- Products Table -->
    <h3 style="margin-top: 30px; font-size: 20px; color: #333;">📚 Περιεχόμενο Παραγγελίας</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background-color: #f1f1f1;">
          <th style="padding: 10px; border: 1px solid #ddd;">📖 Βιβλίο</th>
          <th style="padding: 10px; border: 1px solid #ddd;">📦 Ποσότητα</th>
          <th style="padding: 10px; border: 1px solid #ddd;">💶 Τιμή</th>
        </tr>
      </thead>
      <tbody>
        ${itemsTable}
      </tbody>
    </table>

    <!-- Customer Info -->
    <h3 style="margin-top: 30px; font-size: 20px;">🚚 Πληροφορίες Παράδοσης</h3>
    <p><strong>Διεύθυνση:</strong> ${customerInfo.street}, ${customerInfo.region}, ${customerInfo.postalCode}</p>
    <p><strong>Όροφος:</strong> ${customerInfo.floor} | <strong>Κουδούνι:</strong> ${customerInfo.doorbell}</p>
    <p><strong>Κινητό Τηλέφωνο:</strong> ${customerInfo.phone}</p>

    <!-- Cost -->
    <h3 style="margin-top: 30px;">💰 Συνολικό Κόστος</h3>
    <p style="font-size: 20px; font-weight: bold; color: #388e3c;">${totalCost} €</p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <!-- Footer -->
    <p style="font-size: 14px; text-align: center; color: #555;">
      Θα ειδοποιηθείς όταν ο διανομέας είναι καθ’ οδόν. 📦<br>
      Καλή ανάγνωση και ευχαριστούμε που χρησιμοποιείς το <strong>Book Delivery App</strong>!<br><br>
      — Η ομάδα της <span style="color: #2e7d32; font-weight: bold;">B.D.App</span>
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

export default sendOrderEmailToCustomer;
