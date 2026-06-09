export default function ProjectSection({ projects, handleProjectApproval, formProject, setFormProject, handleSaveProject, handleDeleteProject }) {
  const pendingProjects = projects.filter((p) => p.status === "pending");
  const isEditingProject = formProject.project_id !== null;

  return (
    <div className="space-y-6">
      {/* 1. FORM EDIT MODAL/MELAYANG (Hanya Muncul Pas Klik Edit Proyek) */}
      {isEditingProject && (
        <div className="p-6 bg-amber-50 rounded-xl border-2 border-amber-300 shadow-md max-w-2xl animate-fade-in">
          <h3 className="text-base font-bold text-amber-800 mb-3"> Edit Detail Proyek</h3>
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

      {/* 2. INBOX REQUEST PROYEK (Tetap Sama) */}
      {pendingProjects.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-6 overflow-hidden">
          <h3 className="text-base font-bold text-amber-800 mb-3 flex items-center gap-2">Inbox Request Proyek Baru</h3>
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
                      <button onClick={() => handleProjectApproval(proj.project_id, "active")} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold transition">Terima</button>
                      <button onClick={() => handleProjectApproval(proj.project_id, "rejected")} className="px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-bold transition">Tolak</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TABEL MONITORING UTAMA DENGAN TOMBOL ACTION EDIT/DELETE */}
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
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md tracking-wider ${proj.status === 'active' ? 'bg-blue-50 text-blue-700' : proj.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{proj.status}</span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => setFormProject({ project_id: proj.project_id, project_name: proj.project_name, description: proj.description })} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-xs transition">Edit</button>
                    <button onClick={() => handleDeleteProject(proj.project_id, proj.project_name)} className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded text-xs transition">Hapus</button>
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