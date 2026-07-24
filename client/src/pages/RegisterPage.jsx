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
    <div className="mx-auto max-w-md rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Join the campus navigator community.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40" placeholder="Name" />
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40" placeholder="Email" />
        <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40" placeholder="Password" />
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40">
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="canteenStaff">Canteen Staff</option>
        </select>
        <button className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-500">Register</button>
      </form>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        Already have an account? <Link to="/login" className="font-medium text-sky-600 dark:text-sky-400">Login</Link>
      </p>
    </div>
  );
}
