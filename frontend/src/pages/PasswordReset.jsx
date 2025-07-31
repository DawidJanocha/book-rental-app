import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validLink, setValidLink] = useState(true);

  useEffect(() => {
    if (!token || !userId) {
      setStatus('Invalid reset link');
      setValidLink(false);
    }
  }, [token, userId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!validLink) return;
    if (newPassword !== confirm) {
      setStatus('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setStatus('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/resetPassword', {
        token,
        userId,
        newPassword,
      });
      setStatus('Password updated. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          required
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded"
          autoComplete="new-password"
          disabled={!validLink || isSubmitting}
        />
        <input
          type="password"
          required
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-2 border rounded"
          autoComplete="new-password"
          disabled={!validLink || isSubmitting}
        />
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded"
          disabled={!validLink || isSubmitting}
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
