// utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Ρύθμιση του transporter για την αποστολή email μέσω Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

// Έλεγχος αν η σύνδεση με το email είναι επιτυχής
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Σφάλμα κατά την επαλήθευση της σύνδεσης:", error);
  } else {
    console.log("✅ Η σύνδεση είναι έτοιμη για την αποστολή email.");
  }
});

// Συνάρτηση για την αποστολή του email
export const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Λείπουν τα email credentials από το περιβάλλον');
  }

  try {
    const mailOptions = {
      from: `"BookLibrary App" <${process.env.EMAIL_USER}>`, 
      to: options.to,
      subject: options.subject,
      html: options.html, // HTML περιεχόμενο του email
    };

    // Αποστολή του email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email εστάλη σε ${options.to}`);
  } catch (error) {
    console.error('❌ Σφάλμα κατά την αποστολή του email:', error);
    throw new Error('Αποτυχία αποστολής email');
  }
};
export default sendEmail;