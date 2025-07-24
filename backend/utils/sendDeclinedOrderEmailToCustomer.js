import nodemailer from 'nodemailer';


// Αποστολή email σε πελάτη όταν η παραγγελία απορρίπτεται από το κατάστημα
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
//  Αν δεν έχει δοθεί totalCost, υπολογίζουμε το συνολικό κόστος από τα items
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
    //  Δημιουργία transporter
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

    <!-- Επικεφαλίδα -->
    <h2 style="color: #c62828; font-size: 26px; margin-bottom: 8px;">📕 Η παραγγελία σου δεν έγινε αποδεκτή</h2>
    <p style="font-size: 16px; line-height: 1.6;">
      Αγαπητέ/ή <strong>${username}</strong>, η παραγγελία σου από το κατάστημα <strong>${storeName}</strong> δεν έγινε δεκτή.
    </p>
    <p style="font-size: 15px; color: #555;">
      📞 Μπορείς να επικοινωνήσεις απευθείας με το κατάστημα για περισσότερες λεπτομέρειες ή να επιλέξεις άλλο κατάστημα.
    </p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">

    <!-- Κωδικός παραγγελίας -->
    <p style="font-size: 15px;"><strong>🆔 Κωδικός Παραγγελίας:</strong> ${orderId}</p>

    <!-- Πίνακας προϊόντων -->
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

    <!-- Στοιχεία Πελάτη -->
    <h3 style="margin-top: 30px; font-size: 20px;">🚚 Στοιχεία Παράδοσης</h3>
    <p><strong>Διεύθυνση:</strong> ${customerInfo.street}, ${customerInfo.region}, ${customerInfo.postalCode}</p>
    <p><strong>Όροφος:</strong> ${customerInfo.floor} | <strong>Κουδούνι:</strong> ${customerInfo.doorbell}</p>
    <p><strong>Κινητό Τηλέφωνο:</strong> ${customerInfo.phone}</p>

    <!-- Κόστος -->
    <h3 style="margin-top: 30px;">💰 Συνολικό Κόστος</h3>
    <p style="font-size: 20px; font-weight: bold; color: #388e3c;">${totalCost} €</p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <!-- Υπογραφή -->
    <p style="font-size: 13px; color: #777; text-align: center;">
      📦 Ευχαριστούμε που χρησιμοποιείς το <strong>Book Delivery App</strong><br>
      — Η ομάδα της B.D.App
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

  
  } catch (err) {
    console.error('❌ Αποτυχία αποστολής email στον πελάτη:', err);
  }
};

export default sendDeclinedOrderEmailToCustomer;
