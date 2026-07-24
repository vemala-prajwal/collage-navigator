import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(form);
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in to continue navigating campus.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Email" />
        <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Password" />
        <button className="w-full rounded-xl bg-sky-600 px-4 py-3 font-medium">Login</button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        Need an account? <Link to="/register" className="text-sky-400">Create one</Link>
      </p>
    </div>
  );
}
