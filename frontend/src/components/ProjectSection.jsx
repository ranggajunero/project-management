import { useState } from 'react';
import axios from 'axios';

export default function ProjectSection({ projects, formProject, setFormProject, handleSaveProject, handleDeleteProject }) {
  const isEditingProject = formProject.project_id !== null;
  
  // State untuk modal detail tugas (sudah ada sebelumnya)
  const [selectedProject, setSelectedProject] = useState(null);

  // State khusus untuk modal pembuatan penawaran (Quotation)
  const [quotationModal, setQuotationModal] = useState(null);
  const [quotationForm, setQuotationForm] = useState({ price: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengirim penawaran ke backend
  const submitQuotation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/api/projects/${quotationModal.project_id}/approval`,
        {
          status: 'quotation',
          price: quotationForm.price,
          start_date: quotationForm.start_date,
          end_date: quotationForm.end_date
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuotationModal(null);
      setQuotationForm({ price: '', start_date: '', end_date: '' });
      // Refresh halaman untuk memperbarui data di tabel
      window.location.reload(); 
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengirim penawaran.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menolak proyek langsung
  const rejectProject = async (id) => {
    if (!window.confirm("Yakin ingin menolak request proyek ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/api/projects/${id}/approval`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.reload();
    } catch (error) {
      alert("Gagal menolak proyek.", error);
    }
  };

  const sendToQA = async (id) => {
    if (!window.confirm("Pastikan semua tugas sudah diperiksa. Serahkan proyek ini ke tim QA?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/projects/${id}/send-qa`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (error) {
      alert("Gagal menyerahkan proyek ke QA.", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* FORM EDIT MODAL MELAYANG */}
      {isEditingProject && (
        <div className="p-6 bg-amber-50 rounded-xl border-2 border-amber-300 shadow-md max-w-2xl">
          <h3 className="text-base font-bold text-amber-800 mb-3">Mode Edit Detail Proyek</h3>
          <form onSubmit={handleSaveProject} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required placeholder="Nama Proyek" value={formProject.project_name} onChange={e => setFormProject({...formProject, project_name: e.target.value})} className="p-2 border rounded-lg text-sm bg-white outline-none"/>
              <input type="text" required placeholder="Deskripsi Kebutuhan" value={formProject.description} onChange={e => setFormProject({...formProject, description: e.target.value})} className="p-2 border rounded-lg text-sm bg-white outline-none"/>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setFormProject({project_id: null, project_name:"", description:""})} className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded text-xs">Batal</button>
              <button type="submit" className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded text-xs shadow">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* TABEL MONITORING UTAMA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-blue-600 mb-4">Active Projects Monitoring</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Project Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Client</th>
                <th className="p-4">Status</th>
                <th className="p-4">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((proj) => (
                <tr key={proj.project_id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-bold text-slate-900">{proj.project_name}</td>
                  <td className="p-4 text-slate-500">{proj.description}</td>
                  <td className="p-4 font-medium">{proj.client?.name || "No Client"}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wider ${
                      proj.status === 'active' ? 'bg-blue-50 text-blue-700' : 
                      proj.status === 'pending' ? 'bg-amber-50 text-amber-700' : 
                      proj.status === 'quotation' ? 'bg-purple-50 text-purple-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {proj.status}
                    </span>
                  </td>
                  
                  {/* KOLOM KELOLA DINAMIS BERDASARKAN STATUS */}
                  <td className="p-4 flex gap-2 items-center flex-wrap">
                    {proj.status === 'pending' && (
                      <>
                        <button onClick={() => setQuotationModal(proj)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition shadow-sm">Buat Penawaran</button>
                        <button onClick={() => rejectProject(proj.project_id)} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded text-xs transition border border-rose-200">Tolak</button>
                      </>
                    )}

                    {proj.status === 'quotation' && (
                      <span className="text-xs font-bold text-slate-400 italic">Menunggu respon Klien...</span>
                    )}


                    {proj.status === 'active' && (
                      <>
                        {/* Pengecekan: Jika tugas ada dan SEMUA statusnya 'done', munculkan tombol QA */}
                        {proj.tasks?.length > 0 && proj.tasks.every(t => t.status === 'done') && (
                          <button onClick={() => sendToQA(proj.project_id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition shadow-sm">
                            Serahkan ke QA
                          </button>
                        )}
                        
                        <button onClick={() => setSelectedProject(proj)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-xs transition border border-indigo-200">Detail Tugas</button>
                        <button onClick={() => setFormProject({ project_id: proj.project_id, project_name: proj.project_name, description: proj.description })} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-xs transition">Edit</button>
                        <button onClick={() => handleDeleteProject(proj.project_id, proj.project_name)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded text-xs transition">Hapus</button>
                      </>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BUAT PENAWARAN (QUOTATION) */}
      {quotationModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-lg">Buat Penawaran Proyek</h2>
              <button onClick={() => setQuotationModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            <form onSubmit={submitQuotation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Harga Penawaran</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: Rp 15.000.000" 
                  value={quotationForm.price} 
                  onChange={(e) => setQuotationForm({...quotationForm, price: e.target.value})} 
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    required 
                    value={quotationForm.start_date} 
                    onChange={(e) => setQuotationForm({...quotationForm, start_date: e.target.value})} 
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Selesai</label>
                  <input 
                    type="date" 
                    required 
                    value={quotationForm.end_date} 
                    onChange={(e) => setQuotationForm({...quotationForm, end_date: e.target.value})} 
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition shadow-sm disabled:bg-slate-400"
                >
                  {loading ? 'Memproses...' : 'Kirim Penawaran ke Klien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL TUGAS MANAGER TETAP SAMA */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-100">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-black text-slate-800 text-lg">Detail Tugas: {selectedProject.project_name}</h2>
                <p className="text-xs text-slate-500 font-medium">Pantau status pengerjaan setiap divisi</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition">✕</button>
            </div>
            <div className="p-5 overflow-y-auto bg-slate-50/50">
              {(!selectedProject.tasks || selectedProject.tasks.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">Belum ada tugas yang dialokasikan untuk proyek ini.</div>
              ) : (
                <div className="space-y-3">
                  {[...selectedProject.tasks].sort((a, b) => a.sequence_order - b.sequence_order).map(task => (
                    <div key={task.task_id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded">Urutan {task.sequence_order}</span>
                          <h4 className="font-bold text-slate-800 text-sm">{task.task_name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                      </div>
                      <div className="shrink-0">
                        {task.status === 'done' ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">Selesai</span>
                        ) : task.status === 'review' ? (
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">Sedang Direview</span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">Dikerjakan</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}