export default function ClientProjectGrid({ projects }) {
  if (projects.length === 0) {
    return <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">Belum ada proyek yang terdaftar untuk akun Anda.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((proj) => {
        const totalTasks = proj.tasks ? proj.tasks.length : 0;
        const completedTasks = proj.tasks ? proj.tasks.filter(t => t.status === 'done').length : 0;
        const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        
        let statusColor = "bg-amber-100 text-amber-700";
        if (proj.status === 'active') statusColor = "bg-blue-100 text-blue-700";
        if (proj.status === 'completed') statusColor = "bg-emerald-100 text-emerald-700";
        if (proj.status === 'rejected') statusColor = "bg-rose-100 text-rose-700";

        return (
          <div key={proj.project_id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4 gap-3">
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{proj.project_name}</h3>
                <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{proj.status}</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 min-h-10">{proj.description}</p>
            </div>
            
            {proj.status !== 'pending' && proj.status !== 'rejected' && (
              <div>
                <div className="flex justify-between items-end mb-2 font-bold text-sm text-slate-800">
                  <span>Progres</span>
                  <span className={progressPercentage === 100 ? 'text-emerald-600' : 'text-blue-600'}>{progressPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ease-out ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <div className="text-xs text-slate-500 mt-3 font-medium">Task Selesai: <span className="text-slate-800 font-bold">{completedTasks} dari {totalTasks}</span></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}