import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Placeholder: call backend when available
      await new Promise((r) => setTimeout(r, 600));
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Create account</h2>
          <p className="mt-2 text-sm text-gray-600">Join Smart Industry today</p>
        </div>
        <form className="bg-white shadow-xl rounded-xl p-8 border border-gray-100" onSubmit={onSubmit}>
          <Input label="Full name" name="name" value={form.name} onChange={onChange} placeholder="Alex Taylor" />
          <Input label="Email address" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
          <Input label="Password" type="password" name="password" value={form.password} onChange={onChange} placeholder="••••••••" />
          <Button type="submit" disabled={loading} className="w-full py-3 mt-2">
            {loading ? 'Creating…' : 'Create account'}
          </Button>
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-red-600 hover:text-red-700">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}


