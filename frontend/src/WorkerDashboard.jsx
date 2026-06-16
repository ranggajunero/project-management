import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import WorkerTaskList from './components/WorkerTaskList';
import ProfileSection from './components/ProfileSection';

export default function WorkerDashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [qaProjects, setQaProjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('tasks');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form untuk QA melaporkan bug
  const [bugForm, setBugForm] = useState({ projectId: null, taskId: '', note: '' });
  const [loadingQa, setLoadingQa] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Ambil data tugas reguler
        const taskRes = await axios.get('http://localhost:3000/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
        setTasks(taskRes.data.tasks);

        // Ambil data proyek yang butuh testing
        const qaRes = await axios.get('http://localhost:3000/api/projects/testing', { headers: { Authorization: `Bearer ${token}` } });
        setQaProjects(qaRes.data.projects);
      } catch {
        setError('Gagal memuat data dari server.');
      }
    };
    fetchData();
  }, [refreshTrigger]);

  const updateTaskStatus = async (taskId, newStatus, file = null, workerNote = null) => {
    setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('status', newStatus);
      if (file) {
        formData.append('file', file);
      }
      if (workerNote) {
        formData.append('worker_note', workerNote);
      }

      const response = await axios.patch(`http://localhost:3000/api/tasks/${taskId}/status`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess(response.data.message);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status tugas.');
    }
  };

  const [qaFile, setQaFile] = useState(null);

  const submitQaResult = async (projectId, resultAction) => {
    if (resultAction === 'fail' && (!bugForm.taskId || !bugForm.note)) {
      setError('Pilih tugas yang bermasalah dan isi catatan bug.');
      return;
    }
    if (resultAction === 'pass' && !window.confirm("Pastikan sistem sudah bebas dari bug. Setujui proyek ini?")) {
      return;
    }

    setError(''); setSuccess(''); setLoadingQa(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('result', resultAction);
      if (bugForm.taskId) formData.append('task_id', bugForm.taskId);
      if (bugForm.note) formData.append('note', bugForm.note);
      if (qaFile) formData.append('file', qaFile);

      const response = await axios.post(
        `http://localhost:3000/api/projects/${projectId}/qa-result`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess(response.data.message);
      setBugForm({ projectId: null, taskId: '', note: '' });
      setQaFile(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Gagal mengirim hasil testing.', err);
    } finally {
      setLoadingQa(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      <Header currentRole="worker" activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      {/* Navigasi Tambahan Khusus Worker */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6">
            <button onClick={() => setActiveTab('tasks')} className={`py-4 px-1 border-b-2 font-bold text-sm ${activeTab === 'tasks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Tugas Reguler</button>
            <button onClick={() => setActiveTab('qa')} className={`py-4 px-1 border-b-2 font-bold text-sm ${activeTab === 'qa' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Validasi Sistem (QA)</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium mb-6 shadow-sm">{error}</div>}
        {success && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium mb-6 shadow-sm">{success}</div>}

        {activeTab === 'tasks' && <WorkerTaskList tasks={tasks} updateTaskStatus={updateTaskStatus} />}
        {activeTab === 'profile' && <ProfileSection />}

        {/* HALAMAN KHUSUS QA */}
        {activeTab === 'qa' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-black text-slate-800">Daftar Proyek Membutuhkan Testing</h2>
            {qaProjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 font-medium">Tidak ada proyek yang menunggu validasi saat ini.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {qaProjects.map(proj => (
                  <div key={proj.project_id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-800 p-4 text-white">
                      <h3 className="font-bold text-lg">{proj.project_name}</h3>
                      <p className="text-xs text-slate-300 mt-1">{proj.description}</p>
                    </div>

                    <div className="p-5 border-b border-slate-100">
                      <h4 className="font-bold text-slate-700 text-xs uppercase mb-3">Daftar Fitur yang Telah Dibuat:</h4>
                      <div className="space-y-2">
                        {proj.tasks.map(t => (
                          <div key={t.task_id} className="text-xs flex flex-col p-3 bg-slate-50 rounded border border-slate-100 gap-2">
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-700">{t.task_name}</span>
                              <span className="text-slate-500">Oleh: {t.worker?.name}</span>
                            </div>
                            {t.worker_note && (
                              <div className="text-[10px] bg-white p-2 rounded border border-slate-200 mt-1">
                                <span className="font-bold text-slate-600">Catatan Pekerja:</span> {t.worker_note}
                              </div>
                            )}
                            {t.file_url && (
                              <div className="mt-1">
                                <a href={`http://localhost:3000${t.file_url}`} target="_blank" rel="noreferrer" className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold hover:bg-blue-200 text-[10px]">
                                  Buka File Hasil Kerja
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50">
                      <div className="flex gap-2 mb-4">
                        <button onClick={() => submitQaResult(proj.project_id, 'pass')} disabled={loadingQa} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition shadow-sm">Nyatakan Lolos Testing</button>
                        <button onClick={() => setBugForm({ ...bugForm, projectId: proj.project_id })} className="flex-1 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded transition border border-rose-200">Laporkan Bug</button>
                      </div>

                      {/* FORM LAPOR BUG (Terbuka jika tombol Lapor Bug diklik) */}
                      {bugForm.projectId === proj.project_id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                          <label className="block text-xs font-bold text-rose-700 uppercase">Detail Temuan Bug</label>
                          <select value={bugForm.taskId} onChange={e => setBugForm({ ...bugForm, taskId: e.target.value })} className="w-full p-2 border border-rose-200 rounded text-xs bg-white focus:outline-none">
                            <option value="">-- Pilih Fitur yang Bermasalah --</option>
                            {proj.tasks.map(t => <option key={t.task_id} value={t.task_id}>{t.task_name} ({t.worker?.name})</option>)}
                          </select>
                          <textarea rows="2" placeholder="Jelaskan detail bug atau error yang ditemukan..." value={bugForm.note} onChange={e => setBugForm({ ...bugForm, note: e.target.value })} className="w-full p-2 border border-rose-200 rounded text-xs bg-white focus:outline-none"></textarea>

                          <div>
                            <label className="block text-[10px] font-bold text-rose-700 uppercase mb-1">Upload Screenshot Bug (Opsional)</label>
                            <input type="file" onChange={(e) => setQaFile(e.target.files[0])} className="w-full p-1.5 border border-rose-200 rounded text-xs bg-white focus:outline-none file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100" />
                          </div>

                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setBugForm({ projectId: null, taskId: '', note: '' }); setQaFile(null); }} className="px-3 py-1.5 bg-slate-200 text-slate-600 font-bold text-xs rounded">Batal</button>
                            <button onClick={() => submitQaResult(proj.project_id, 'fail')} disabled={loadingQa} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow-sm">Kirim Laporan Bug</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}