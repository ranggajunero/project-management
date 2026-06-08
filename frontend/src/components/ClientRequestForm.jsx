export default function ClientRequestForm({ formReq, setFormReq, handleRequestProject }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:w-1/2">
      <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">Ajukan Proyek Baru</h3>
      <form onSubmit={handleRequestProject} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Nama Proyek / Aplikasi</label>
          <input type="text" required placeholder="Contoh: Aplikasi Kasir Cafe" value={formReq.project_name} onChange={e => setFormReq({...formReq, project_name: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-slate-50 outline-none transition"/>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Deskripsi Kebutuhan</label>
          <textarea rows="4" required placeholder="Jelaskan secara singkat fitur apa saja yang Anda butuhkan..." value={formReq.description} onChange={e => setFormReq({...formReq, description: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-slate-50 outline-none transition"/>
        </div>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition shadow-sm">
          Kirim Request Proyek
        </button>
      </form>
    </div>
  );
}