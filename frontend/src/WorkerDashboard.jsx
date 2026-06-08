import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import WorkerTaskList from './components/WorkerTaskList';

export default function WorkerDashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
        setTasks(response.data.tasks);
      } catch {
        setError('Gagal memuat tugas. Silakan coba lagi.');
      }
    };

    fetchTasks();
  }, [refreshTrigger]);

  const updateTaskStatus = async (taskId, newStatus) => {
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:3000/api/tasks/${taskId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(response.data.message); setRefreshTrigger(prev => prev + 1);
    } catch (err) { setError(err.response?.data?.message || 'Gagal mengubah status tugas.'); }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      <Header currentRole="worker" onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium mb-6">{error}</div>}
        {success && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium mb-6">{success}</div>}
        
        <WorkerTaskList tasks={tasks} updateTaskStatus={updateTaskStatus} />
      </div>
    </div>
  );
}