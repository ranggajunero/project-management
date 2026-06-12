import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import ClientProjectGrid from './components/ClientProjectGrid';
import ClientRequestForm from './components/ClientRequestForm';
import ProfileSection from './components/ProfileSection';

export default function ClientDashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('monitoring'); // State untuk Tab
  const [formReq, setFormReq] = useState({ project_name: '', description: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Linter bakal senyum lihat ini karena fungsinya ada di DALAM useEffect
  useEffect(() => { 
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/projects', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setProjects(response.data.projects);
      } catch {
        setError('Gagal memuat data proyek. Silakan coba lagi.');
      }
    };

    fetchProjects();
  }, [refreshTrigger]); // <-- useEffect ini bakal jalan ulang kalau refreshTrigger nilainya berubah

  const handleRequestProject = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/projects/request', formReq, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSuccess(response.data.message);
      setFormReq({ project_name: '', description: '' });
      
      // INI GANTINYA fetchClientProjects()
      setRefreshTrigger(prev => prev + 1); 
      
      setActiveTab('monitoring'); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Gagal mengirim request.'); 
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      <Header 
          currentRole="client" 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={onLogout} 
        />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium mb-6">{error}</div>}
        {success && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium mb-6">{success}</div>}

        {/* LOGIKA SWITCHING TAB */}
        {activeTab === 'monitoring' && (
          <ClientProjectGrid projects={projects} />
        )}

        {activeTab === 'request' && (
          <ClientRequestForm formReq={formReq} setFormReq={setFormReq} handleRequestProject={handleRequestProject} />
        )}

        {activeTab === 'profile' && <ProfileSection />}
      </div>
    </div>
  );
}