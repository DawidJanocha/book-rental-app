import nodemailer from 'nodemailer';

// 👉 Δημιουργία transporter μία φορά
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

// ✅ 1. Αποστολή στον Admin
const sendToAdmin = async ({ name, email, message }) => {
  return transporter.sendMail({
    from: `"Επικοινωνία Πελάτη" <${process.env.MAIL_USER}>`,
    to: 'djnaocha1994@gmail.com',
    subject: '📬 Νέο Μήνυμα από Πελάτη',
    html: `
      <h3>Ο πελάτης έστειλε μήνυμα:</h3>
      <p><strong>Όνομα:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Μήνυμα:</strong></p>
      <p>${message}</p>
    `,
  });
};

// ✅ 2. Αποστολή αντιγράφου στον πελάτη
const sendCopyToCustomer = async ({ name, email, message }) => {
  return transporter.sendMail({
    from: `"F.D.App Support" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Αντίγραφο Μηνύματος Επικοινωνίας',
    html: `
      <h3>Ευχαριστούμε που επικοινωνήσατε μαζί μας!</h3>
      <p>Αντίγραφο του μηνύματος σας:</p>
      <hr>
      <p><strong>Όνομα:</strong> ${name}</p>
      <p><strong>Μήνυμα:</strong></p>
      <p>${message}</p>
      <hr>
      <p>📬 F.D.App</p>
    `,
  });
};

// ✅ Κεντρική controller function
const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await sendToAdmin({ name, email, message });
    await sendCopyToCustomer({ name, email, message });

    res.status(200).json({ message: 'Email εστάλη με επιτυχία' });
  } catch (error) {
    console.error('❌ Σφάλμα αποστολής email:', error);
    res.status(500).json({ error: 'Αποτυχία αποστολής email' });
  }
};

// Εξαγωγή της κεντρικής συνάρτησης
export { sendContactEmail };
