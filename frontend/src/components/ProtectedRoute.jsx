import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// προστατευμένη διαδρομή που ελέγχει αν ο χρήστης είναι συνδεδεμένος
// και αν έχει τον κατάλληλο ρόλο (π.χ. 'admin', 'seller')
// αν δεν πληροί τις προϋποθέσεις, γίνεται ανακατεύθυνση
const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);
  // αν δεν υπάρχει χρήστης ή ο ρόλος δεν ταιριάζει, ανακατευθύνουμε στην αρχική σελίδα
  // αν υπάρχει χρήστης αλλά ο ρόλος δεν ταιριάζει,
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
