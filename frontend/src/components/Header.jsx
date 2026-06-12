// File: src/components/Header.jsx
export default function Header({ currentRole, activeTab, setActiveTab, onDownloadReport, onLogout }) {
  // Bikin variabel helper biar gampang dibaca
  const isAdmin = currentRole === "admin";
  const isManager = currentRole === "manager";
  const isWorker = currentRole === "worker";
  const isClient = currentRole === "client";
  const isManagerOrAdmin = isAdmin || isManager;

  // Render Judul berdasarkan Role
  const renderTitle = () => {
    if (isAdmin) return <span className="text-purple-700">ADMIN PANEL</span>;
    if (isManager) return <span className="text-blue-700">MANAGER PANEL</span>;
    if (isWorker) return <span className="text-blue-800">WORKER PORTAL</span>;
    if (isClient) return <span className="text-slate-900">CLIENT PORTAL</span>;
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* BAGIAN KIRI: Logo & Menu Tabs */}
          <div className="flex items-center gap-8">
            <div className="shrink-0 text-xl font-black tracking-tight">{renderTitle()}</div>

            {/* Navigasi Dinamis Berdasarkan Role */}
            <div className="hidden md:flex space-x-2">
              {/* TAB KHUSUS ADMIN & MANAGER */}
              {isManagerOrAdmin && (
                <>
                  <button onClick={() => setActiveTab("projects")} className={`px-3 py-2 rounded-lg text-sm font-bold transition ${activeTab === "projects" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                    Monitoring Proyek
                  </button>
                  <button onClick={() => setActiveTab("tasks")} className={`px-3 py-2 rounded-lg text-sm font-bold transition ${activeTab === "tasks" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                    Manajemen Tugas
                  </button>
                </>
              )}
              {isAdmin && (
                <button onClick={() => setActiveTab("users")} className={`px-3 py-2 rounded-lg text-sm font-bold transition ${activeTab === "users" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  Kelola Akun
                </button>
              )}

              {/* TAB KHUSUS WORKER */}
              {isWorker && <span className="px-3 py-2 rounded-lg text-sm font-bold bg-blue-50 text-blue-700">📝 My Tasks</span>}

              {/* TAB KHUSUS CLIENT */}
              {isClient && (
                <>
                  <button onClick={() => setActiveTab("monitoring")} className={`px-3 py-2 rounded-lg text-sm font-bold transition ${activeTab === "monitoring" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}>
                    Monitoring Proyek
                  </button>
                  <button onClick={() => setActiveTab("request")} className={`px-3 py-2 rounded-lg text-sm font-bold transition ${activeTab === "request" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}>
                    Ajukan Request
                  </button>
                </>
              )}
            </div>
          </div>

          {/* BAGIAN KANAN: Tombol Aksi */}
          <div className="flex items-center gap-3">
            {/* profile */}
            <button 
              onClick={() => setActiveTab?.('profile')} 
              className={`px-4 py-2 font-bold text-sm rounded-lg transition ${activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              Profil Saya
            </button>
            {/* cetak pdf */}
            {isManagerOrAdmin && (
              <button onClick={onDownloadReport} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center gap-1.5">
                📄 Cetak PDF
              </button>
            )}
            <button onClick={onLogout} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
