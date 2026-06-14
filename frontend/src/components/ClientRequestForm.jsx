import { useState } from "react";

export default function ClientRequestForm({ formReq, setFormReq, handleRequestProject }) {
  // State lokal khusus untuk nampung tanggal deadline
  const [deadline, setDeadline] = useState("");

  // Fungsi pencegat sebelum dikirim ke backend
  const onSubmitInterceptor = (e) => {
    e.preventDefault();
    
    // Gabungin deskripsi asli dengan deadline
    const finalDescription = deadline 
      ? `${formReq.description}\n\n[Target Selesai Klien: ${deadline}]` 
      : formReq.description;

    // Panggil fungsi save utama dengan deskripsi yang udah dimodifikasi
    handleRequestProject(e, finalDescription); 
    setDeadline(""); // Reset
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl animate-fade-in">
      <h3 className="text-lg font-bold text-slate-800 mb-4">  Ajukan Proyek Baru</h3>
      
      <form onSubmit={onSubmitInterceptor} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Proyek</label>
          <input type="text" required value={formReq.project_name} onChange={(e) => setFormReq({...formReq, project_name: e.target.value})} className="w-full p-2 border rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Deadline (Opsional)</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"/>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi & Kebutuhan</label>
          <textarea required rows="4" value={formReq.description} onChange={(e) => setFormReq({...formReq, description: e.target.value})} placeholder="Jelaskan secara detail apa yang Anda butuhkan..." className="w-full p-2 border rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition w-full shadow-md">
          Kirim Pengajuan Proyek
        </button>
      </form>
    </div>
  );
}