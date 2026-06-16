import { useState } from 'react';

export default function WorkerTaskList({ tasks, updateTaskStatus }) {
  const [files, setFiles] = useState({});
  const [workerNotes, setWorkerNotes] = useState({});

  const handleFileChange = (taskId, e) => {
    setFiles({ ...files, [taskId]: e.target.files[0] });
  };

  const handleNoteChange = (taskId, e) => {
    setWorkerNotes({ ...workerNotes, [taskId]: e.target.value });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak ada deadline";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-slate-500 font-medium">Belum ada tugas yang dialokasikan untuk Anda saat ini.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <div key={task.task_id} className={`bg-white rounded-xl border p-5 flex flex-col shadow-sm transition ${task.is_locked ? 'border-slate-200 opacity-60 bg-slate-50' : 'border-slate-200 hover:shadow-md'}`}>

          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded mb-2 inline-block">
                Urutan {task.sequence_order}
              </span>
              <h3 className="font-bold text-slate-800 text-lg">{task.task_name}</h3>
            </div>
            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${task.status === 'done' ? 'bg-emerald-50 text-emerald-700' :
              task.status === 'review' ? 'bg-purple-50 text-purple-700' :
                task.status === 'revision' ? 'bg-rose-50 text-rose-700' :
                  'bg-blue-50 text-blue-700'
              }`}>
              {task.status}
            </span>
          </div>

          <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            Proyek: <span className="text-slate-800">{task.project?.project_name}</span>
            {task.deadline && (
              <div className="text-[10px] text-rose-600 mt-1">
                Batas Waktu: {formatDate(task.deadline)}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-500 mb-5 flex-1 whitespace-pre-wrap">{task.description}</p>

          {/* AREA TOMBOL AKSI */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {task.is_locked ? (
              <div className="w-full py-2 bg-slate-200 text-slate-500 rounded-lg text-xs font-bold text-center border border-slate-300">
                Terkunci (Menunggu Tugas Sebelumnya Selesai)
              </div>
            ) : task.status === 'todo' || task.status === 'revision' ? (
              <div className="space-y-3">
                {task.status === 'revision' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                    <p className="text-[10px] font-bold text-rose-800 uppercase mb-1">Catatan Revisi:</p>
                    <p className="text-xs text-rose-600 font-medium">{task.approvals?.[task.approvals.length - 1]?.note || "Perbaiki data"}</p>
                    {task.approvals?.[task.approvals.length - 1]?.file_url && (
                      <a href={`http://localhost:3000${task.approvals[task.approvals.length - 1].file_url}`} target="_blank" rel="noreferrer" className="inline-block mt-2 text-[10px] bg-rose-200 text-rose-800 px-2 py-1 rounded font-bold hover:bg-rose-300">Lihat Screenshot Bug</a>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Catatan Pekerja (Opsional)</label>
                  <textarea rows="2" placeholder="Tuliskan catatan atau link hasil kerja..." value={workerNotes[task.task_id] || ''} onChange={(e) => handleNoteChange(task.task_id, e)} className="w-full p-2 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-blue-400"></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Upload Hasil Kerja (Opsional)</label>
                  <input type="file" onChange={(e) => handleFileChange(task.task_id, e)} className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <button onClick={() => updateTaskStatus(task.task_id, 'review', files[task.task_id], workerNotes[task.task_id])} className={`w-full py-2 ${task.status === 'revision' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-xs font-bold transition shadow-sm`}>
                  {task.status === 'revision' ? 'Kirim Ulang Hasil Revisi' : 'Kirim Hasil untuk Direview'}
                </button>
              </div>
            ) : task.status === 'review' ? (
              <div className="space-y-2">
                <div className="w-full py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold text-center border border-purple-100">
                  Sedang Diperiksa Manager
                </div>
                {task.file_url && (
                  <a href={`http://localhost:3000${task.file_url}`} target="_blank" rel="noreferrer" className="block text-center text-[10px] text-purple-600 hover:underline">Lihat File Terkirim</a>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold text-center border border-emerald-100">
                  Tugas Telah Disetujui
                </div>
                {task.file_url && (
                  <a href={`http://localhost:3000${task.file_url}`} target="_blank" rel="noreferrer" className="block text-center text-[10px] text-emerald-600 hover:underline">Lihat File Akhir</a>
                )}
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}