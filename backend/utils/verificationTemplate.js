
// backend/utils/verificationTemplate.js

// Συνάρτηση για τη δημιουργία του HTML περιεχομένου του email επιβεβαίωσης
// Περιλαμβάνει το όνομα χρήστη και τον σύνδεσμο επιβεβαίωσης
export const getVerificationEmailHtml = (username, verificationLink) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="padding: 20px; text-align: center;">
          <h2>👋 Καλώς ήρθες, ${username}!</h2>
          <p>Ευχαριστούμε που έκανες εγγραφή στην πλατφόρμα μας.</p>
          <p>Για να ολοκληρώσεις την εγγραφή, κάνε επιβεβαίωση του email σου πατώντας στο παρακάτω κουμπί:</p>
          <a href="${verificationLink}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
            ✅ Επιβεβαίωση Email
          </a>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">Αν δεν έκανες εσύ την εγγραφή, αγνόησε αυτό το email.</p>
        </div>
      </div>
    </div>
  `;
};
