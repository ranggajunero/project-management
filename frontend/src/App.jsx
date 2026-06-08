import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import WorkerDashboard from './WorkerDashboard'; 
import ClientDashboard from './ClientDashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('');
  };

  // --- LOGIKA PINTU MASUK ---
  if (isLoggedIn) {
    if (userRole === 'manager' || userRole === 'admin') {
      return <Dashboard onLogout={handleLogout} />;
    } else if (userRole === 'worker') {
      return <WorkerDashboard onLogout={handleLogout} />;
    } else if (userRole === 'client') {
      return <ClientDashboard onLogout={handleLogout} />;
    } else {
      // Jaga-jaga kalau role tidak dikenali
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Role tidak dikenali!</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      );
    }
  }

  // Kalau belum login, tampilkan form login
  return <Login onLoginSuccess={() => {
    setIsLoggedIn(true);
    setUserRole(localStorage.getItem('user_role'));
  }} />;
}