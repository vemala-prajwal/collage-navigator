import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    await register(form);
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-slate-400">Join the campus navigator community.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Name" />
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Email" />
        <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" placeholder="Password" />
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="canteenStaff">Canteen Staff</option>
        </select>
        <button className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium">Register</button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        Already have an account? <Link to="/login" className="text-sky-400">Login</Link>
      </p>
    </div>
  );
}
