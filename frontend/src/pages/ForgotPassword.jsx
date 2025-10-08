import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Placeholder: call backend when available
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Forgot password</h2>
          <p className="mt-2 text-sm text-gray-600">We will email you a reset link</p>
        </div>
        {sent ? (
          <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100 text-center">
            <p className="text-gray-700">If an account exists for <b>{email}</b>, you will receive an email shortly.</p>
            <Link to="/login" className="inline-block mt-6 text-red-600 hover:text-red-700">Back to Sign in</Link>
          </div>
        ) : (
          <form className="bg-white shadow-xl rounded-xl p-8 border border-gray-100" onSubmit={onSubmit}>
            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Button type="submit" disabled={loading} className="w-full py-3 mt-2">
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">Back to Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


