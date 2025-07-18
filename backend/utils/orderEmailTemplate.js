// utils/orderEmailTemplate.js

/**
 * Δημιουργεί HTML email για επιβεβαίωση ενοικίασης (προς seller ή customer)
 * @param {Object} options - Πληροφορίες για το email
 * @param {string} options.username - Όνομα πελάτη
 * @param {Array} options.books - Λίστα βιβλίων [{title, author, rentalPrice}]
 * @param {string} [options.comment] - Σχόλια πελάτη
 * @param {boolean} options.isCustomer - true για email στον πελάτη
 * @param {string} [options.total] - Συνολικό ποσό (μόνο για customer)
 * @param {Array} [options.backOrderedTitles] - Λίστα τίτλων που είναι σε έλλειψη
 */
export const generateOrderEmailHTML = ({ username, books, comment, isCustomer, total, backOrderedTitles = [] }) => {
  const greeting = isCustomer
    ? `Αγαπητέ/ή <strong>${username}</strong>,<br><br>
       Ευχαριστούμε θερμά για την προτίμησή σου στο Book Rental App του Coding Factory 7.<br>
       Λάβαμε την παραγγελία σου και ακολουθούν οι λεπτομέρειες:`
    : `📬 Νέα παραγγελία από τον πελάτη <strong>${username}</strong> με τα εξής βιβλία:`;

  const rows = books.map(book => `
    <tr>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.quantity || 1}</td>
      <td>${book.rentalPrice?.toFixed(2) || '0.00'} €</td>
    </tr>
  `).join('');

  const customerComment = comment
    ? `<p><strong>📩 Σχόλιο πελάτη:</strong> ${comment}</p>`
    : '';

  const totalRow = isCustomer
    ? `<p><strong>💰 Σύνολο:</strong> ${total} €</p>`
    : '';

  const backOrderNotice = backOrderedTitles.length > 0
    ? `<div style="margin-top: 15px; color: #b40000; font-weight: bold;">
         ⚠️ ${isCustomer
           ? `Τα παρακάτω προϊόντα είναι προσωρινά σε έλλειψη και θα παραδοθούν σε τουλάχιστον <u>2 εβδομάδες</u>:`
           : `Τα εξής προϊόντα βρίσκονται σε έλλειψη και χρειάζονται προμήθεια:`}
         <ul>
           ${backOrderedTitles.map(title => `<li>${title}</li>`).join('')}
         </ul>
       </div>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5">
      <h2 style="color: #4A90E2;">📚 Book Rental App</h2>
      <p>${greeting}</p>

      <table border="1" cellspacing="0" cellpadding="8" style="margin-top: 10px; border-collapse: collapse;">
        <thead>
         <tr style="background-color: #f5f5f5;">
            <th>📘 Τίτλος</th>
            <th>✍️ Συγγραφέας</th>
            <th>🔢 Ποσότητα</th>
            <th>💸 Τιμή</th>
         </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      ${totalRow}
      ${customerComment}
      ${backOrderNotice}

      <br />
      <p>📅 Η ομάδα του Book Rental App</p>
    </div>
  `;
};
