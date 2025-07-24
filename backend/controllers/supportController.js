import { sendSupportToAdmin, sendSupportConfirmationToUser } from '../utils/supportEmail.js';

export const handleSupportRequest = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await sendSupportToAdmin({ name, email, message });
    await sendSupportConfirmationToUser({ name, email });

    res.status(200).json({ message: 'Το μήνυμά σας εστάλη με επιτυχία.' });
  } catch (error) {
    console.error('Support Email Error:', error);
    res.status(500).json({ message: 'Σφάλμα κατά την αποστολή. Δοκιμάστε ξανά.' });
  }
};
