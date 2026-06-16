const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// manage login & register user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, division } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database menggunakan Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        division
      }
    });

    res.status(201).json({ message: "User berhasil dibuat!", user: { id: newUser.user_id, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email lewat Prisma
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan!" });

    // Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password salah!" });

    // Buat JWT Token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, division: user.division },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        role: user.role,
        division: user.division
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// jwt middleware untuk proteksi endpoint dan ambil data user dari token
const authenticateToken = (req, res, next) => {
  // Ambil token dari header 'Authorization'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Akses ditolak! Token tidak ditemukan." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token tidak valid atau sudah kedaluwarsa!" });

    // Simpan data user dari token ke dalam req.user agar bisa dipakai di endpoint
    req.user = user;
    next();
  });
};

// ambil data usres untuk panel admin
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Tarik semua data user dari database, tapi password nggak usah ikut ditarik biar aman
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        division: true
      },
      orderBy: {
        user_id: 'desc' // Urutkan dari yang paling baru dibuat
      }
    });

    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Gagal menarik data pengguna' });
  }
});

// ADMIN
// UPDATE USER (KHUSUS ADMIN)
app.patch('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    // Validasi: Hanya Admin yang boleh edit akun orang lain
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Admin yang bisa mengubah data." });
    }

    const userId = parseInt(req.params.id);
    const { name, email, password, role, division } = req.body;

    // Siapkan data yang mau di-update
    let updateData = {
      name,
      email,
      role,
      division: role === 'worker' ? division : null // Reset divisi kalau bukan worker
    };

    // JIKA ADMIN MENGISI PASSWORD BARU, KITA ENKRIPSI!
    // Kalau dikosongin, berarti password lamanya tetap aman.
    if (password && password.trim() !== '') {
      const bcrypt = require('bcrypt'); // pastikan bcrypt terdeteksi
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update ke database
    await prisma.user.update({
      where: { user_id: userId },
      data: updateData
    });

    res.json({ message: "Data pengguna berhasil diperbarui!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui data pengguna." });
  }
});

// HAPUS USER (KHUSUS ADMIN)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    // Validasi: Hanya Admin yang boleh hapus
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Admin yang bisa menghapus data." });
    }

    const userId = parseInt(req.params.id);

    // Keamanan ekstra: Cegah admin menghapus akunnya sendiri saat sedang login
    if (userId === req.user.user_id) {
      return res.status(400).json({ message: "Anda tidak bisa menghapus akun Anda sendiri saat sedang login!" });
    }

    // Eksekusi hapus di database
    await prisma.user.delete({
      where: { user_id: userId }
    });

    res.json({ message: "Akun pengguna berhasil dihapus secara permanen!" });
  } catch (error) {
    console.error(error);
    // Kalau error karena user ini masih punya project/task (Foreign Key Constraint)
    res.status(500).json({ message: "Gagal menghapus akun. Pastikan user ini tidak sedang terikat dengan tugas atau proyek aktif!" });
  }
});

// manager
// create project
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    // Validasi: Hanya Manager (atau Admin) yang boleh bikin project
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Manager yang bisa membuat project." });
    }

    const { client_id, project_name, description, start_date, end_date } = req.body;

    // manager_id diambil otomatis dari siapa yang sedang login (lewat token)
    const manager_id = req.user.user_id;

    // Simpan ke database
    const newProject = await prisma.project.create({
      data: {
        client_id: parseInt(client_id),
        manager_id: manager_id,
        project_name,
        description,
        // Konversi string tanggal ke format DateTime Prisma (jika ada)
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      }
    });

    res.status(201).json({ message: "Project berhasil dibuat!", project: newProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// liat list project
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: {
          select: { name: true, email: true } // Ambil nama & email client
        },
        manager: {
          select: { name: true } // Ambil nama manager
        },
        tasks: {
          select: { status: true } // Cuma ambil statusnya aja buat ngitung persentase
        },
        tasks: true,
      },
      orderBy: { project_id: 'desc' }
    });

    res.json({ message: "Berhasil mengambil data project", projects });
  } catch (error) {
    console.error("ERROR GET PROJECTS:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE PROJECT (MANAGER & ADMIN)
app.patch('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Manager atau Admin yang bisa edit proyek." });
    }
    const projectId = parseInt(req.params.id);
    const { project_name, description } = req.body;

    await prisma.project.update({
      where: { project_id: projectId },
      data: { project_name, description }
    });
    res.json({ message: "Data proyek berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui proyek." });
  }
});

// DELETE PROJECT (MANAGER & ADMIN)
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }
    const projectId = parseInt(req.params.id);

    // Hapus dulu task yang terikat dengan proyek ini (Cascade Delete manual)
    await prisma.task.deleteMany({ where: { project_id: projectId } });

    // Baru hapus proyeknya
    await prisma.project.delete({ where: { project_id: projectId } });
    res.json({ message: "Proyek beserta seluruh tugas di dalamnya berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus proyek." });
  }
});

// UPDATE TASK (MANAGER & ADMIN)
app.patch('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }
    const taskId = parseInt(req.params.id);
    const { task_name, description, deadline, project_id, worker_id } = req.body;

    await prisma.task.update({
      where: { task_id: taskId },
      data: {
        task_name,
        description,
        deadline: deadline ? new Date(deadline) : null,
        project_id: parseInt(project_id),
        worker_id: parseInt(worker_id),
        status: "todo"
      }
    });
    res.json({ message: "Tugas berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui tugas." });
  }
});

// DELETE TASK (MANAGER & ADMIN)
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }
    const taskId = parseInt(req.params.id);

    // Hapus dulu data approval yang terikat dengan task ini
    await prisma.approval.deleteMany({ where: { task_id: taskId } });

    await prisma.task.delete({ where: { task_id: taskId } });
    res.json({ message: "Tugas berhasil dihapus dari workspace!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus tugas." });
  }
});

// 1. ENDPOINT: AMBIL DAFTAR WORKER 
app.get('/api/workers', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    const workers = await prisma.user.findMany({
      where: {
        role: 'worker',
        NOT: {
          division: {
            contains: 'QA'
          }
        }
      },
      select: { user_id: true, name: true, division: true }
    });

    res.json({ workers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ENDPOINT: CREATE TASK & ASSIGN TO WORKER
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    // Validasi: Hanya Manager atau Admin yang bisa membuat & assign task
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Manager yang bisa membuat task." });
    }

    const { project_id, worker_id, task_name, description, deadline, sequence_order } = req.body;

    // Simpan task baru ke database lewat Prisma
    const newTask = await prisma.task.create({
      data: {
        project_id: parseInt(project_id),
        worker_id: parseInt(worker_id),
        task_name,
        description,
        deadline: deadline ? new Date(deadline) : null,
        sequence_order: sequence_order ? parseInt(sequence_order) : 0,
        status: "todo"
      }
    });

    res.status(201).json({ message: "Task berhasil dibuat dan diassign ke Worker!", task: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. ENDPOINT: GET ALL TASKS 
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    let whereCondition = {};

    if (req.user.role === 'worker') {
      whereCondition = { worker_id: req.user.user_id };
    }

    const rawTasks = await prisma.task.findMany({
      where: whereCondition,
      include: {
        project: {
          select: { project_name: true }
        },
        worker: {
          select: { name: true, division: true }
        },
        approvals: {
          select: { note: true, approval_status: true, file_url: true }
        }
      },
      orderBy: {
        sequence_order: 'asc'
      }
    });

    // LOGIKA SEQUENTIAL (URUTAN TUGAS)
    // Cek apakah ada tugas dengan urutan lebih kecil yang belum selesai di project yang sama
    const tasks = await Promise.all(rawTasks.map(async (task) => {
      const pendingPreviousTasks = await prisma.task.count({
        where: {
          project_id: task.project_id,
          sequence_order: { lt: task.sequence_order }, // lt = less than (lebih kecil dari)
          status: { not: 'done' }
        }
      });

      return {
        ...task,
        is_locked: pendingPreviousTasks > 0 // Jika > 0, berarti tugas ini terkunci
      };
    }));

    res.json({ message: "Berhasil mengambil data task", tasks });
  } catch (error) {
    console.error("ERROR GET TASKS:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. ENDPOINT: UPDATE STATUS TASK// UBAH STATUS TUGAS (Worker kirim ke review, Manager approve/reject)
app.patch('/api/tasks/:id/status', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status, worker_note } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Cek keberadaan task
    const task = await prisma.task.findUnique({ where: { task_id: taskId } });
    if (!task) return res.status(404).json({ message: "Tugas tidak ditemukan!" });

    const dataToUpdate = { status: status };
    if (file_url) dataToUpdate.file_url = file_url;
    if (worker_note !== undefined) dataToUpdate.worker_note = worker_note;

    // --- CASE 1: WORKER SUBMIT TUGAS (MENGIRIM FILE) ---
    if (status === 'review') {
      if (req.user.role !== 'worker') {
        return res.status(403).json({ message: "Hanya Worker yang dapat mensubmit tugas!" });
      }

      await prisma.task.update({
        where: { task_id: taskId },
        data: dataToUpdate
      });
      return res.json({ message: "Tugas berhasil dikirim untuk direview beserta file-nya!" });
    }

    // --- CASE 2: MANAGER KEMBALIKAN TUGAS KE REVISION ---
    if (status === 'revision') {
      if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak!" });
      }

      await prisma.task.update({
        where: { task_id: taskId },
        data: { status: 'revision' }
      });
      return res.json({ message: "Tugas dikembalikan ke Worker untuk revisi." });
    }

    // Default update (jika bukan review/revision)
    if (req.user.role === 'worker') {
      if (task.worker_id !== req.user.user_id) {
        return res.status(403).json({ message: "Akses ditolak! Ini bukan task milikmu." });
      }

      // VALIDASI KUNCI URUTAN: Pastikan tidak ada task dengan urutan lebih kecil yang belum 'done'
      const pendingPreviousTasks = await prisma.task.count({
        where: {
          project_id: task.project_id,
          sequence_order: { lt: task.sequence_order },
          status: { not: 'done' }
        }
      });

      if (pendingPreviousTasks > 0) {
        return res.status(403).json({ message: "Gagal! Anda harus menunggu tugas pada urutan sebelumnya selesai dikerjakan." });
      }
    }

    // Update status jika lolos validasi
    const updatedTask = await prisma.task.update({
      where: { task_id: taskId },
      data: { status }
    });

    res.json({ message: `Status task berhasil diperbarui menjadi ${status}`, task: updatedTask });
  } catch (error) {
    console.error("ERROR UPDATE TASK STATUS:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/approvals', authenticateToken, async (req, res) => {
  try {
    // Validasi Hanya Manager atau Admin yang bisa kasih approval
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Manager yang berhak memberikan approval." });
    }

    const { task_id, approval_status, note } = req.body; // approval_status: approved / rejected

    // Cek apakah task-nya ada
    const task = await prisma.task.findUnique({ where: { task_id: parseInt(task_id) } });
    if (!task) return res.status(404).json({ message: "Task tidak ditemukan!" });

    // Tentukan status akhir task berdasarkan keputusan manager
    let finalTaskStatus = 'done';
    if (approval_status === 'rejected') {
      finalTaskStatus = 'revision';
    }

    // Eksekusi transaksi
    const result = await prisma.$transaction([
      // 1. Simpan riwayat log ke tabel approvals
      prisma.approval.create({
        data: {
          task_id: parseInt(task_id),
          approved_by: req.user.user_id,
          approval_status,
          note
        }
      }),
      // 2. Ubah status di tabel tasks
      prisma.task.update({
        where: { task_id: parseInt(task_id) },
        data: { status: finalTaskStatus }
      })
    ]);

    // AUTO-UPDATE PROJECT STATUS TO 'testing' IF ALL TASKS ARE 'done'
    if (finalTaskStatus === 'done') {
      const pendingTasksCount = await prisma.task.count({
        where: {
          project_id: task.project_id,
          status: { not: 'done' }
        }
      });
      if (pendingTasksCount === 0) {
        await prisma.project.update({
          where: { project_id: task.project_id },
          data: { status: 'testing' }
        });
      }
    }

    res.status(201).json({
      message: `Approval berhasil diproses. Status task sekarang: ${finalTaskStatus}`,
      approval_log: result[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CLIENT
// 1. ENDPOINT: CLIENT REQUEST PROJECT
app.post('/api/projects/request', authenticateToken, async (req, res) => {
  try {
    // Validasi: Hanya Client yang boleh akses ini
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Client yang bisa request proyek." });
    }

    const { project_name, description } = req.body;

    const newProject = await prisma.project.create({
      data: {
        project_name,
        description,
        client: {
          connect: { user_id: req.user.user_id }
        },
        status: 'pending' // Status otomatis ditahan dulu
      }
    });

    res.status(201).json({ message: "Request proyek berhasil dikirim ke Manager!", project: newProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat request proyek." });
  }
});

// 2. ENDPOINT: MANAGER MENGIRIMKAN PENAWARAN (HARGA & TIMELINE)
app.patch('/api/projects/:id/approval', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Manager atau Admin yang dapat memproses request." });
    }

    const projectId = parseInt(req.params.id);
    const { status, price, start_date, end_date } = req.body; // status bisa 'quotation' atau 'rejected'

    const updatedProject = await prisma.project.update({
      where: { project_id: projectId },
      data: {
        status: status,
        manager_id: req.user.user_id,
        price: status === 'quotation' ? price : null,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null
      }
    });

    const messageResponse = status === 'quotation'
      ? "Penawaran harga dan timeline berhasil dikirimkan ke Client."
      : "Request proyek berhasil ditolak.";

    res.json({ message: messageResponse, project: updatedProject });
  } catch (error) {
    console.error("ERROR PROJECT APPROVAL:", error);
    res.status(500).json({ message: "Gagal memproses penawaran proyek." });
  }
});

// 3. ENDPOINT NEW: CLIENT MENYETUJUI ATAU MENOLAK PENAWARAN MANAGER
app.patch('/api/projects/:id/quotation-response', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: "Akses ditolak! Hanya Client yang dapat merespon penawaran." });
    }

    const projectId = parseInt(req.params.id);
    const { action } = req.body; // Isinya 'approve' atau 'reject'

    let finalStatus = 'active';
    if (action === 'reject') {
      finalStatus = 'rejected';
    }

    const updatedProject = await prisma.project.update({
      where: { project_id: projectId },
      data: { status: finalStatus }
    });

    res.json({
      message: `Penawaran proyek berhasil di-${action === 'approve' ? 'setujui dan proyek sekarang aktif' : 'tolak'}.`,
      project: updatedProject
    });
  } catch (error) {
    console.error("ERROR QUOTATION RESPONSE:", error);
    res.status(500).json({ message: "Gagal memproses respon penawaran." });
  }
});

// UPDATE PASSWORD (UNTUK SEMUA ROLE DARI HALAMAN PROFIL)
app.patch('/api/profile/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Password lama dan password baru wajib diisi." });
    }

    // Cari data user berdasarkan token yang aktif
    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    // Validasi apakah password lama sesuai dengan yang ada di database
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama yang Anda masukkan salah." });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: "Password berhasil diperbarui secara aman." });
  } catch (error) {
    console.error("Error update password:", error);
    res.status(500).json({ message: "Gagal memperbarui password pada server." });
  }
});

//  Qa Cek hasil pekerjaan

// 1. MANAGER: SERAHKAN PROYEK KE QA
app.patch('/api/projects/:id/send-qa', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    await prisma.project.update({
      where: { project_id: parseInt(req.params.id) },
      data: { status: 'testing' }
    });

    res.json({ message: "Proyek berhasil diserahkan ke tim QA untuk diuji." });
  } catch (error) {
    console.error("ERROR SEND TO QA:", error);
    res.status(500).json({ message: "Gagal menyerahkan proyek ke QA." });
  }
});

// 2. QA: AMBIL DAFTAR PROYEK YANG BUTUH TESTING
app.get('/api/projects/testing', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    const projects = await prisma.project.findMany({
      where: { status: 'testing' },
      include: {
        tasks: {
          include: { worker: { select: { name: true, division: true } } }
        }
      }
    });

    res.json({ projects });
  } catch (error) {
    console.error("ERROR GET QA PROJECTS:", error);
    res.status(500).json({ message: "Gagal menarik data proyek testing." });
  }
});

// 3. QA: SUBMIT HASIL TESTING (LOLOS / BUG)
app.post('/api/projects/:id/qa-result', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    const projectId = parseInt(req.params.id);
    const { result, task_id, note } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (result === 'pass') {
      // Jika lolos, status proyek siap diserahkan ke klien
      await prisma.project.update({
        where: { project_id: projectId },
        data: { status: 'ready_to_close' }
      });
      res.json({ message: "Proyek dinyatakan lolos testing dan siap diserahkan ke Klien." });

    } else if (result === 'fail') {
      // Jika ada bug, kembalikan proyek ke active dan task ke revision
      await prisma.$transaction([
        prisma.project.update({
          where: { project_id: projectId },
          data: { status: 'active' }
        }),
        prisma.task.update({
          where: { task_id: parseInt(task_id) },
          data: { status: 'revision' }
        }),
        prisma.approval.create({
          data: {
            task_id: parseInt(task_id),
            approved_by: req.user.user_id,
            approval_status: 'rejected_by_qa',
            note: `[BUG REPORT QA] ${note}`,
            file_url: file_url || null
          }
        })
      ]);
      res.json({ message: "Bug berhasil dilaporkan. Tugas telah dikembalikan ke Programmer untuk direvisi." });
    }
  } catch (error) {
    console.error("ERROR QA RESULT:", error);
    res.status(500).json({ message: "Gagal memproses hasil testing." });
  }
});

// MANAGER: TUTUP PROYEK (SELESAI)
app.patch('/api/projects/:id/close', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    const projectId = parseInt(req.params.id);
    const { final_result_link } = req.body;

    await prisma.project.update({
      where: { project_id: projectId },
      data: {
        status: 'completed',
        final_result_link: final_result_link || null
      }
    });

    res.json({ message: "Proyek resmi ditutup. Hasil telah dikirim ke Klien." });
  } catch (error) {
    console.error("ERROR CLOSE PROJECT:", error);
    res.status(500).json({ message: "Gagal menutup proyek." });
  }
});

// DASHBOARD STATS: AMBIL RINGKASAN DATA
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak!" });
    }

    // Menggunakan Prisma count() sesuai permintaan untuk menghitung agregat
    const [pending, active, testing, completed] = await prisma.$transaction([
      prisma.project.count({ where: { status: 'pending' } }),
      prisma.project.count({ where: { status: 'active' } }),
      prisma.project.count({ where: { status: 'testing' } }),
      prisma.project.count({ where: { status: 'completed' } })
    ]);

    res.json({ stats: { pending, active, testing, completed } });
  } catch (error) {
    console.error("ERROR GET STATS:", error);
    res.status(500).json({ message: "Gagal memuat statistik." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));