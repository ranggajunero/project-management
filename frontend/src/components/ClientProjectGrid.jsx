import { useState } from 'react';

export default function ClientProjectGrid({ projects }) {
  // State untuk nyimpen project mana yang lagi diklik detailnya
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          // --- LOGIKA PROGRESS BAR ---
          const tasks = proj.tasks || [];
          const totalTasks = tasks.length;
          const doneTasks = tasks.filter(t => t.status === 'done').length;
          const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

          return (
            <div key={proj.project_id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-lg">{proj.project_name}</h3>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${proj.status === 'active' ? 'bg-blue-50 text-blue-700' : proj.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {proj.status}
                </span>
              </div>
              
              <p className="text-sm text-slate-500 mb-5 flex-1 whitespace-pre-wrap">{proj.description}</p>

              {/* PROGRESS BAR UI */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-500">Progress Proyek</span>
                  <span className="text-blue-600">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{doneTasks} dari {totalTasks} task selesai</p>
              </div>

              <button onClick={() => setSelectedProject(proj)} className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
                Lihat Detail Task
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL POP-UP DETAIL TASK (Muncul kalau ada project yang diklik) */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-100 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-black text-slate-800 text-lg">{selectedProject.project_name}</h2>
                <p className="text-xs text-slate-500 font-medium">Tracking Detail Pengerjaan</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition">
                ✕
              </button>
            </div>

            {/* List Task Modal */}
            <div className="p-5 overflow-y-auto bg-slate-50/50">
              {(!selectedProject.tasks || selectedProject.tasks.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">
                  Manager belum membuat rincian task untuk proyek ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProject.tasks.map(task => (
                    <div key={task.task_id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{task.task_name}</h4>
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