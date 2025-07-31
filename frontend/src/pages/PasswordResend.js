import { useState } from 'react';
import api from '../utils/axiosInstance';

export default function PasswordResend() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/passwordResend', { email });
      setStatus('If that email exists, you’ll receive a reset link.');
    } catch (err) {
      setStatus('Something went wrong. Try again later.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          autoComplete="email"
        />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
          Send Reset Link
        </button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
