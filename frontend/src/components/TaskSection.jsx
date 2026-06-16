import { useState } from "react";

export default function TaskSection({ projects, workers, tasks, formTask, setFormTask, handleCreateTask, notes, setNotes, handleApprovalAction, handleEditTaskClick, handleDeleteTask }) {
  // State untuk nyimpen filter ID proyek yang dipilih
  const [filterProjectId, setFilterProjectId] = useState("");

  // Logika Filter: Kalau ada proyek yang dipilih, saring task-nya. Kalau kosong, tampilkan semua.
  const filteredTasks = filterProjectId ? tasks.filter((task) => task.project_id.toString() === filterProjectId.toString()) : tasks;

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak ada deadline";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="space-y-6">
      {/* FORM DELEGASI TUGAS BARU (Tetap Sama) */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm max-w-3xl">
        <h3 className="text-lg font-bold text-blue-600 mb-4">Kirim Tugas Baru ke Worker</h3>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Urutan Pengerjaan</label>
            <input
              type="number"
              min="1"
              required
              placeholder="Contoh: 1"
              value={formTask.sequence_order}
              onChange={(e) => setFormTask({ ...formTask, sequence_order: parseInt(e.target.value) || 1 })}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nama Tugas / Fitur</label>
            <input
              type="text"
              required
              placeholder="Slicing halaman login..."
              value={formTask.task_name}
              onChange={(e) => setFormTask({ ...formTask, task_name: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Deskripsi Instruksi</label>
            <textarea
              rows="2"
              placeholder="Instruksi pengerjaan..."
              value={formTask.description}
              onChange={(e) => setFormTask({ ...formTask, description: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Pilih Project Induk</label>
              <select
                required
                value={formTask.project_id}
                onChange={(e) => setFormTask({ ...formTask, project_id: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">-- Pilih Project --</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Ditugaskan Kepada</label>
              <select
                required
                value={formTask.worker_id}
                onChange={(e) => setFormTask({ ...formTask, worker_id: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">-- Pilih Karyawan --</option>
                {workers.map((w) => (
                  <option key={w.user_id} value={w.user_id}>
                    {w.name} ({w.division || "No Division"})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Batas Waktu (Deadline)</label>
            <input
              type="date"
              value={formTask.deadline}
              onChange={(e) => setFormTask({ ...formTask, deadline: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition shadow-sm">
            Kirim Tugas
          </button>
        </form>
      </div>

      {/* WORKFLOW PROCESS TABLE DENGAN FITUR FILTER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        {/* HEADER TABEL & DROPDOWN FILTER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-emerald-600">Task Process & Workflow</h3>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="text-sm font-bold text-slate-600">Filter Proyek:</span>
            <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)} className="p-1.5 text-sm rounded bg-white border border-slate-300 focus:outline-none focus:border-emerald-500">
              <option value="">Semua Proyek</option>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABEL TASK */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Task Info</th>
                <th className="p-4">Project Name</th>
                <th className="p-4">Assigned Worker</th>
                <th className="p-4">Status</th>
                <th className="p-4 w-87.5">Action / Revision Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Tidak ada tugas di proyek ini.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  let badgeStyle = "bg-amber-100 text-amber-800";
                  if (task.status === "progress") badgeStyle = "bg-blue-100 text-blue-800";
                  if (task.status === "review") badgeStyle = "bg-purple-100 text-purple-800";
                  if (task.status === "revision") badgeStyle = "bg-rose-100 text-rose-800";
                  if (task.status === "done") badgeStyle = "bg-emerald-100 text-emerald-800";

                  return (
                    <tr key={task.task_id} className="hover:bg-slate-50/50 transition align-top">
                      <td className="p-4">
                        <div className="inline-block px-2 py-0.5 mb-1.5 bg-slate-800 text-white text-[10px] font-bold rounded uppercase tracking-wider">Urutan {task.sequence_order}</div>
                        <div className="font-bold text-slate-900">{task.task_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{task.description}</div>
                      </td>
                      <td className="p-4 text-slate-700">
                        <div className="font-bold">{task.project?.project_name}</div>
                        <div className="text-[11px] font-bold text-rose-600 mt-1">Batas Waktu: {formatDate(task.deadline)}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-900">{task.worker?.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded tracking-wide ${badgeStyle}`}>{task.status}</span>
                      </td>
                      <td className="p-4">
                        {task.status === "review" ? (
                          <div className="space-y-2">
                            {task.worker_note && (
                              <div className="text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
                                <span className="font-bold text-slate-600">Catatan Pekerja:</span> {task.worker_note}
                              </div>
                            )}
                            {task.file_url && (
                              <a href={`http://localhost:3000${task.file_url}`} target="_blank" rel="noreferrer" className="inline-block px-2 py-1 text-[10px] bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200">
                                Buka File Hasil Kerja
                              </a>
                            )}
                            <input
                              type="text"
                              placeholder="Catatan revisi..."
                              value={notes[task.task_id] || ""}
                              onChange={(e) => setNotes({ ...notes, [task.task_id]: e.target.value })}
                              className="w-full p-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-purple-500 bg-white outline-none"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleApprovalAction(task.task_id, "approved")} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition">
                                ✓ Approve
                              </button>
                              <button onClick={() => handleApprovalAction(task.task_id, "rejected")} className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition">
                                ✕ Reject
                              </button>
                            </div>
                          </div>
                        ) : task.status === "done" ? (
                          <div className="space-y-1">
                            <span className="text-emerald-600 font-bold text-xs">✓ Selesai Sempurna</span>
                            {task.worker_note && (
                              <div className="text-[10px] text-slate-500 mt-1"><span className="font-bold text-slate-600">Note:</span> {task.worker_note}</div>
                            )}
                            {task.file_url && (
                              <div className="mt-1">
                                <a href={`http://localhost:3000${task.file_url}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-bold">Buka File Akhir</a>
                              </div>
                            )}
                          </div>
                        ) : task.status === "revision" ? (
                          <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
                            <strong>Revisi:</strong> {task.approvals?.[task.approvals.length - 1]?.note || "Perbaiki data"}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Menunggu worker...</span>
                        )}
                        <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2">
                          <button onClick={() => handleEditTaskClick(task)} className="text-[11px] font-bold text-blue-600 hover:underline">
                            Ubah Instruksi
                          </button>
                          <button onClick={() => handleDeleteTask(task.task_id, task.task_name)} className="text-[11px] font-bold text-rose-600 hover:underline">
                            Hapus Task
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
