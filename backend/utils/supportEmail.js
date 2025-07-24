import nodemailer from 'nodemailer';

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

export const sendSupportToAdmin = async ({ name, email, message }) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>📬 Νέο αίτημα υποστήριξης</h2>
      <p><strong>Όνομα:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Μήνυμα:</strong></p>
      <div style="background: #f9f9f9; padding: 12px; border-left: 4px solid #ffc107;">
        ${message}
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        Book Rental App Support — ${new Date().toLocaleString('el-GR')}
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Book Rental Support" <${process.env.MAIL_USER}>`,
    to: 'djanocha1994@gmail.com',
    subject: '📨 Νέο Μήνυμα Υποστήριξης',
    html,
  });
};

export const sendSupportConfirmationToUser = async ({ name, email }) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #ffc107;">✅ Λάβαμε το μήνυμά σας</h2>
      <p>Γεια σου <strong>${name}</strong>,</p>
      <p>Η ομάδα μας έλαβε το αίτημά σου και θα το εξετάσει το συντομότερο δυνατό.</p>
      <p>📚 Ευχαριστούμε που επικοινώνησες με το <strong>Book Rental App</strong>.</p>
      <hr style="margin: 24px 0;" />
      <p style="font-size: 13px; color: #888;">Αυτό το μήνυμα εστάλη αυτόματα – δεν χρειάζεται απάντηση.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Book Rental Support" <${process.env.MAIL_USER}>`,
    to: email,
    subject: '✅ Λάβαμε το αίτημά σας – Book Rental App',
    html,
  });
};
