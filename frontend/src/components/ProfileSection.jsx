import { useState } from 'react';
import axios from 'axios';

export default function ProfileSection() {
  const userName = localStorage.getItem('user_name') || 'Pengguna';
  const userRole = localStorage.getItem('user_role') || 'User';
  
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setError('Semua kolom password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:3000/api/profile/password', 
        passwordForm, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(response.data.message);
      setPasswordForm({ oldPassword: '', newPassword: '' }); // Reset form jika sukses
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* KARTU PROFIL UTAMA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-4 flex justify-between items-end">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
              <div className="w-full h-full bg-slate-100 rounded-full border-4 border-slate-50 flex items-center justify-center">
                <span className="text-4xl font-black text-slate-400">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-full uppercase tracking-wider border border-blue-100">
              {userRole}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-800">{userName}</h2>
            <p className="text-slate-500 font-medium mt-1">Sistem Manajemen Workspace</p>
          </div>
        </div>
      </div>

      {/* PENGATURAN AKUN / GANTI PASSWORD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">
          Pengaturan Keamanan
        </h3>
        
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg">
            {success}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleChangePassword}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password Lama</label>
              <input 
                type="password" 
                required
                placeholder="Masukkan password saat ini..." 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password Baru</label>
              <input 
                type="password" 
                required
                placeholder="Ketik password baru..." 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-sm transition shadow-md disabled:bg-slate-400"
            >
              {loading ? 'Memproses...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}