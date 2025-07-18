//controllers/userController.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import UserDetails from '../models/UserDetails.js';

// Αποθήκευση ή ενημέρωση στοιχείων χρήστη
export const saveUserDetails = async (req, res) => {
  const { firstName, lastName, street, region, postalCode, phone ,floor ,doorbell} = req.body;

  try {
    let details = await UserDetails.findOne({ user: req.user._id });

    if (details) {
      details.firstName = firstName;
      details.lastName = lastName;
      details.street = street;
      details.region = region;
      details.postalCode = postalCode;
      details.phone = phone;
      details.floor=floor;
      details.doorbell = doorbell;
      await details.save();
    } else {
      details = await UserDetails.create({
        user: req.user._id,
        firstName,
        lastName,
        street,
        region,
        postalCode,
        phone,
        floor,
        doorbell
      });
    }

    res.status(200).json(details);
  } catch (error) {
  console.error('Σφάλμα στο saveUserDetails:', error); // 👈 δες ακριβώς τι σπάει
  res.status(500).json({ message: 'Σφάλμα κατά την αποθήκευση των στοιχείων.' });
}

};

// Ανάκτηση στοιχείων χρήστη
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const details = await UserDetails.findOne({ user: userId });
    if (!details) {
      return res.status(404).json({ message: 'Δεν υπάρχουν αποθηκευμένα στοιχεία' });
    }

    res.status(200).json(details);
  } catch (err) {
    console.error('❌ Σφάλμα στο getUserDetails:', err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή' });
  }
};


// Αλλαγή κωδικού πρόσβασης
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Ο τρέχων κωδικός είναι λάθος.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Ο κωδικός άλλαξε επιτυχώς.' });
  } catch (error) {
    res.status(500).json({ message: 'Σφάλμα κατά την αλλαγή του κωδικού.' });
  }
};
