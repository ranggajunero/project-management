export default function UserSection({ formUser, setFormUser, handleSaveUser, handleEditClick, users, handleDeleteUser }) {
  // Bikin mode gampang untuk ngecek ini lagi ngedit atau nambah baru
  const isEditing = formUser.user_id !== null;

  // Fungsi batal edit, kembali ke mode tambah baru
  const cancelEdit = () => {
    setFormUser({ user_id: null, name: "", email: "", password: "", role: "worker", division: "" });
  };

  const divisiOptions = [
    "Programmer",
    "System Analyst",
    "UI/UX Designer",
    "Quality Assurance (QA)"
  ];

  const rolePriority = { admin: 1, manager: 2, client: 3, worker: 4 };
  
  const sortedUsers = [...users].sort((a, b) => {
    // Urutkan berdasarkan prioritas role dulu
    if (rolePriority[a.role] !== rolePriority[b.role]) {
      return rolePriority[a.role] - rolePriority[b.role];
    }
    // Kalau role-nya sama, urutkan berdasarkan abjad nama
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* FORM REGISTRASI / EDIT USER */}
      <div className={`p-6 bg-white rounded-xl border-2 shadow-sm xl:col-span-1 h-fit transition-all ${isEditing ? "border-amber-400 shadow-amber-100" : "border-slate-200"}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isEditing ? "text-amber-600" : "text-purple-600"}`}>{isEditing ? "✏️ Edit Data Akun" : "➕ Buat Akun Pengguna Baru"}</h3>

        <form onSubmit={handleSaveUser} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formUser.name}
              onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formUser.email}
              onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Password {isEditing && <span className="text-rose-500 normal-case font-normal">(Kosongkan jika tidak ingin diganti)</span>}</label>
            <input
              type="password"
              required={!isEditing}
              placeholder={isEditing ? "Ketik password baru..." : ""}
              value={formUser.password}
              onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Role Akses</label>
            <select
              value={formUser.role}
              onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="worker">Worker (Karyawan)</option>
              <option value="manager">Manager</option>
              <option value="client">Client (Klien)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formUser.role === "worker" && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Divisi Kerja</label>
              <select
                required
                value={formUser.division || ""}
                onChange={(e) => setFormUser({ ...formUser, division: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="" disabled>-- Pilih Divisi --</option>
                {divisiOptions.map((divisi, index) => (
                  <option key={index} value={divisi}>{divisi}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex flex-col gap-2">
            <button type="submit" className={`w-full py-2.5 text-white rounded-lg font-bold text-sm transition shadow-sm ${isEditing ? "bg-amber-500 hover:bg-amber-600" : "bg-purple-600 hover:bg-purple-700"}`}>
              {isEditing ? "Simpan Perubahan" : "Daftarkan User"}
            </button>
            {isEditing && (
              <button type="button" onClick={cancelEdit} className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm transition shadow-sm">
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABEL DAFTAR USER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden xl:col-span-2">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Daftar Pengguna Sistem</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-semibold text-slate-900">
                    {u.name}
                    {u.division && <div className="text-[11px] text-slate-400 font-normal mt-0.5">{u.division}</div>}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-800"}`}>{u.role}</span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleEditClick(u)} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-bold transition">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteUser(u.user_id, u.name)} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded text-xs font-bold transition">
                      Hapus
                    </button>
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
