import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        email,
        password
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_name', user.name);

      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, periksa jaringan Anda.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-blue-700 tracking-tight">System Login</h2>
          <p className="text-slate-500 text-sm mt-2">Silakan masuk ke akun workspace Anda</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}