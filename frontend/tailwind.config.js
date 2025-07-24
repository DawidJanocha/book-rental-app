// tailwind.config.js
module.exports = {
  // Εδώ ορίζουμε τις διαδρομές των αρχείων που θα χρησιμοποιούν Tailwind CSS
  // Αυτό επιτρέπει στο Tailwind να "γνωρίζει" πού να ψάξει για κλάσεις CSS
  // και να δημιουργήσει τα αντίστοιχα CSS αρχεία κατά τη διάρκεια της διαδικασίας build  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {    
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
