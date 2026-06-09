import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- IMPORT KOMPONEN ANAKAN (ALAMAT BLADE LAYOUTS DI REACT) ---
import Header from "./components/Header";
import ProjectSection from "./components/ProjectSection";
import TaskSection from "./components/TaskSection";
import UserSection from "./components/UserSection";

export default function Dashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [notes, setNotes] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formProject, setFormProject] = useState({ project_id: null, project_name: "", description: "" });

  // State Navbar Utama untuk Mendeteksi Halaman Aktif
  const [activeTab, setActiveTab] = useState("projects");

  // State Form Inputs
  const [formTask, setFormTask] = useState({ task_name: "", description: "", deadline: "", project_id: "", worker_id: "" });
  const [formUser, setFormUser] = useState({ user_id: null, name: "", email: "", password: "", role: "worker", division: "" });

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("user_role");
        setCurrentRole(role);

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const projectRes = await axios.get("http://localhost:3000/api/projects", config);
        setProjects(projectRes.data.projects);

        const taskRes = await axios.get("http://localhost:3000/api/tasks", config);
        setTasks(taskRes.data.tasks);

        const workerRes = await axios.get("http://localhost:3000/api/workers", config);
        setWorkers(workerRes.data.workers);

        if (role === "admin") {
          const userRes = await axios.get("http://localhost:3000/api/users", config);
          setUsers(userRes.data.users);
        }
      } catch {
        setError("Gagal memuat data workspace.");
      }
    };

    fetchWorkspaceData();
  }, [refreshTrigger]); // <-- Dia bakal nge-fetch ulang otomatis kalau angka refreshTrigger berubah

  const handleDownloadReport = () => {
    // Tarik nama user yang login dari localStorage
    const userName = localStorage.getItem("user_name") || "Unknown User";
    const doc = new jsPDF();

    // Desain Header Laporan
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    // Logika Ganti Judul Berdasarkan Tab Aktif
    if (activeTab === "projects") {
      doc.text("LAPORAN MONITORING PROYEK (ACTIVE & PENDING)", 14, 20);
    } else if (activeTab === "tasks") {
      doc.text("LAPORAN MANAJEMEN TUGAS & WORKFLOW", 14, 20);
    } else {
      alert("Halaman ini tidak memiliki format laporan.");
      return;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const tanggalCetak = `${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID")}`;

    // Tampilin Nama dan Role pencetak
    doc.text(`Tanggal Cetak : ${tanggalCetak}`, 14, 28);
    doc.text(`Dicetak Oleh   : ${userName} (Hak Akses: ${currentRole.toUpperCase()})`, 14, 34);

    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // Variabel Penampung Tabel
    let tableColumn = [];
    let tableRows = [];

    // JIKA LAGI DI TAB PROYEK
    if (activeTab === "projects") {
      tableColumn = ["ID", "Nama Proyek", "Deskripsi Kebutuhan", "Klien", "Status"];
      projects.forEach((proj) => {
        tableRows.push([proj.project_id, proj.project_name, proj.description, proj.client?.name || "-", proj.status.toUpperCase()]);
      });
    }
    // JIKA LAGI DI TAB TUGAS
    else if (activeTab === "tasks") {
      tableColumn = ["Nama Tugas", "Deskripsi", "Proyek Induk", "Ditugaskan Ke", "Status"];
      tasks.forEach((task) => {
        tableRows.push([task.task_name, task.description, task.project?.project_name || "-", task.worker?.name || "-", task.status.toUpperCase()]);
      });
    }

    // Render ke PDF
    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: activeTab === "projects" ? [29, 78, 216] : [16, 185, 129], fontStyle: "bold" }, // Biru buat proyek, Hijau buat tugas
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: activeTab === "projects" ? { 2: { cellWidth: 60 } } : { 1: { cellWidth: 50 } },
    });

    doc.save(`Laporan_${activeTab.toUpperCase()}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleProjectApproval = async (projectId, newStatus) => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`http://localhost:3000/api/projects/${projectId}/approval`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(response.data.message);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memproses request proyek.");
    }
  };


  const handleCreateTask = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      const token = localStorage.getItem("token");
      if (formTask.task_id) {
        // JIKA ADA ID = MODE UPDATE
        await axios.patch(`http://localhost:3000/api/tasks/${formTask.task_id}`, formTask, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess("Tugas berhasil di-update!");
      } else {
        // JIKA GAK ADA ID = MODE CREATE
        await axios.post("http://localhost:3000/api/tasks", formTask, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess("Tugas baru berhasil dikirim!");
      }
      setFormTask({ task_name: "", description: "", deadline: "", project_id: "", worker_id: "" });
      setRefreshTrigger(prev => prev + 1);
    } catch { setError("Gagal menyimpan tugas."); }
  };

  // Fungsi Simpan User
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");

      if (formUser.user_id) {
        // MODE EDIT: Tembak ke endpoint PATCH
        await axios.patch(`http://localhost:3000/api/users/${formUser.user_id}`, formUser, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess(`Data akun ${formUser.name} berhasil di-update!`);
      } else {
        // MODE CREATE: Tembak ke endpoint POST (Register)
        await axios.post("http://localhost:3000/api/register", formUser, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess(`Akun ${formUser.name} berhasil dibuat!`);
      }

      // Reset form dan refresh data
      setFormUser({ user_id: null, name: "", email: "", password: "", role: "worker", division: "" });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data user.");
    }
  };

  // Fungsi tambahan untuk memancing data masuk ke form saat tombol Edit diklik
  const handleEditClick = (user) => {
    setFormUser({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      password: "", // Sengaja dikosongin, biar admin ga liat password lama
      role: user.role,
      division: user.division || "",
    });
    // Scroll otomatis ke atas biar admin langsung liat formnya
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // fungsi untuk delate user
  const handleDeleteUser = async (userId, userName) => {
    // Munculkan peringatan sebelum menghapus
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun "${userName}" secara permanen?`)) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:3000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(response.data.message);

      // Reset form kalau yang dihapus kebetulan lagi diedit
      if (formUser.user_id === userId) {
        setFormUser({ user_id: null, name: "", email: "", password: "", role: "worker", division: "" });
      }

      setRefreshTrigger((prev) => prev + 1); // Refresh tabel
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus pengguna.");
    }
  };

  const handleApprovalAction = async (taskId, actionStatus) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    const noteForTask = notes[taskId] || "";
    if (actionStatus === "rejected" && !noteForTask.trim()) {
      setError("Wajib mengisi catatan (note) jika Anda merevisi task!");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/api/approvals", { task_id: taskId, approval_status: actionStatus, note: noteForTask }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(response.data.message);
      setNotes((prev) => ({ ...prev, [taskId]: "" }));
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memproses tindakan.");
    }
  };

  // --- ACTION CRUD PROJECT ---
  const handleSaveProject = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:3000/api/projects/${formProject.project_id}`, formProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Proyek berhasil diperbarui!");
      setFormProject({ project_id: null, project_name: "", description: "" });
      setRefreshTrigger(prev => prev + 1);
    } catch { setError("Gagal mengupdate proyek."); }
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`HAPUS PROYEK "${name}"? Semua task di dalamnya akan ikut terhapus permanen!`)) return;
    setError(""); setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:3000/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(res.data.message);
      setRefreshTrigger(prev => prev + 1);
    } catch { setError("Gagal menghapus proyek."); }
  };

  // --- ACTION CRUD TASK ---
  const handleEditTaskClick = (task) => {
    setFormTask({
      task_id: task.task_id, 
      task_name: task.task_name,
      description: task.description,
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      project_id: task.project_id,
      worker_id: task.worker_id
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTask = async (id, name) => {
    if (!window.confirm(`Hapus tugas "${name}" secara permanen?`)) return;
    setError(""); setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:3000/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(res.data.message);
      setRefreshTrigger(prev => prev + 1);
    } catch { setError("Gagal menghapus tugas."); }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* 1. NAVBAR & NAVIGATION COMPONENT */}
      <Header currentRole={currentRole} activeTab={activeTab} setActiveTab={setActiveTab} onDownloadReport={handleDownloadReport} onLogout={onLogout} />

      {/* BODY WORKSPACE AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NOTIFIKASI ALERTS */}
        {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium mb-6 shadow-sm">{error}</div>}
        {success && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium mb-6 shadow-sm">{success}</div>}

        {/* 2. SWITCH STATEMENT: LOGIKA ROUTING HALAMAN BERDASARKAN NAV-TAB */}
        {activeTab === "projects" && (
          <ProjectSection 
            projects={projects} 
            handleProjectApproval={handleProjectApproval} 
            formProject={formProject} 
            setFormProject={setFormProject} 
            handleSaveProject={handleSaveProject} 
            handleDeleteProject={handleDeleteProject}
          />
        )}

        {activeTab === "tasks" && (
          <TaskSection 
            projects={projects} workers={workers} tasks={tasks} 
            formTask={formTask} setFormTask={setFormTask} handleCreateTask={handleCreateTask} 
            notes={notes} setNotes={setNotes} handleApprovalAction={handleApprovalAction} 
            handleEditTaskClick={handleEditTaskClick} 
            handleDeleteTask={handleDeleteTask}       
          />
        )}

        {activeTab === "users" && currentRole === "admin" && <UserSection formUser={formUser} setFormUser={setFormUser} handleSaveUser={handleSaveUser} handleEditClick={handleEditClick} handleDeleteUser={handleDeleteUser} users={users} />}
      </div>
    </div>
  );
}
