export default function WorkerTaskList({ tasks, updateTaskStatus }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Tugas</th>
              <th className="p-4">Proyek</th>
              <th className="p-4">Deadline</th>
              <th className="p-4">Status Saat Ini</th>
              <th className="p-4 w-50">Aksi Pekerjaan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Hore! Belum ada tugas untukmu saat ini.</td>
              </tr>
            ) : (
              tasks.map((task) => {
                let badgeStyle = "bg-amber-100 text-amber-800";
                if (task.status === 'progress') badgeStyle = "bg-blue-100 text-blue-800";
                if (task.status === 'review') badgeStyle = "bg-purple-100 text-purple-800";
                if (task.status === 'revision') badgeStyle = "bg-rose-100 text-rose-800";
                if (task.status === 'done') badgeStyle = "bg-emerald-100 text-emerald-800";

                return (
                  <tr key={task.task_id} className="hover:bg-slate-50/50 transition align-top">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{task.task_name}</div>
                      <div className="text-xs text-slate-500 mt-1">{task.description}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{task.project?.project_name}</td>
                    <td className="p-4">{task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded tracking-wider ${badgeStyle}`}>{task.status}</span>
                      {task.status === 'revision' && (
                        <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 mt-2">
                          <strong>Catatan:</strong> {task.approvals?.[task.approvals.length - 1]?.note}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {task.status === 'todo' || task.status === 'revision' ? (
                        <button onClick={() => updateTaskStatus(task.task_id, 'progress')} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm">Mulai Kerjakan</button>
                      ) : task.status === 'progress' ? (
                        <button onClick={() => updateTaskStatus(task.task_id, 'review')} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-sm">Kirim ke Manager</button>
                      ) : task.status === 'review' ? (
                        <span className="text-xs font-medium text-amber-700 flex items-center gap-1">Menunggu Review</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}