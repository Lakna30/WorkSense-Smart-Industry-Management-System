import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import useAppStore from '../lib/store.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function SignUp() {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/auth/register', form);
      console.log('Registration successful:', data);
      setUser(data.user); // Store user data
      alert('Registration successful! You are now logged in.');
      navigate('/home', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First name" 
              name="first_name" 
              value={form.first_name} 
              onChange={onChange} 
              placeholder="John" 
              required
            />
            <Input 
              label="Last name" 
              name="last_name" 
              value={form.last_name} 
              onChange={onChange} 
              placeholder="Doe" 
              required
            />
          </div>
          <Input 
            label="Email address" 
            type="email" 
            name="email" 
            value={form.email} 
            onChange={onChange} 
            placeholder="you@example.com" 
            required
          />
          <Input 
            label="Password" 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={onChange} 
            placeholder="••••••••" 
            required
            minLength="6"
          />
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


