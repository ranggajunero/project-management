// File: src/components/ProjectSection.jsx
export default function ProjectSection({ projects, handleProjectApproval}) {
  const pendingProjects = projects.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6">
      {/* 1. INBOX REQUEST PROYEK (Hanya Muncul Jika Ada Data Pending) */}
      {pendingProjects.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-6 overflow-hidden animate-pulse-once">
          <h3 className="text-base font-bold text-amber-800 mb-3 flex items-center gap-2">🔔 Inbox Request Proyek Baru</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-700">
              <thead className="bg-amber-100/60 text-amber-900 font-bold border-b border-amber-200">
                <tr>
                  <th className="p-3">Nama Proyek</th>
                  <th className="p-3">Deskripsi Kebutuhan</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {pendingProjects.map((proj) => (
                  <tr key={proj.project_id}>
                    <td className="p-3 font-bold text-slate-900">{proj.project_name}</td>
                    <td className="p-3 text-slate-600">{proj.description}</td>
                    <td className="p-3 font-medium">{proj.client?.name || "-"}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleProjectApproval(proj.project_id, "active")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-sm transition">Terima</button>
                      <button onClick={() => handleProjectApproval(proj.project_id, "rejected")} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold shadow-sm transition">Tolak</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TABEL ACTIVE PROJECTS */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((proj) => (
                <tr key={proj.project_id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-bold text-slate-900">{proj.project_name}</td>
                  <td className="p-4 text-slate-500">{proj.description}</td>
                  <td className="p-4 font-medium">{proj.client?.name || "No Client"}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wider ${proj.status === 'active' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-700'}`}>{proj.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}