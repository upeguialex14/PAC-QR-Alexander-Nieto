import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { GuardView } from './components/GuardView';
import { AdminView } from './components/AdminView';

export type UserRole = 'admin' | 'guard' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  qrCode?: string;
  createdAt: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  guardId: string;
  guardName: string;
  status: 'granted' | 'denied';
}

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'guard' | 'admin'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  // Cargar datos simulados al inicio
  useEffect(() => {
    // Usuarios de ejemplo
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@sistema.com',
        name: 'Administrador Principal',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'guarda@sistema.com',
        name: 'Juan Pérez',
        role: 'guard',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'estudiante1@sena.edu.co',
        name: 'María García',
        role: 'student',
        qrCode: 'QR-STUDENT-001',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        email: 'estudiante2@sena.edu.co',
        name: 'Carlos Rodríguez',
        role: 'student',
        qrCode: 'QR-STUDENT-002',
        createdAt: new Date().toISOString(),
      },
    ];

    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(mockUsers);
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }

    const savedLogs = localStorage.getItem('accessLogs');
    if (savedLogs) {
      setAccessLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setCurrentView('admin');
      } else if (user.role === 'guard') {
        setCurrentView('guard');
      } else {
        alert('Los estudiantes no pueden iniciar sesión en este sistema');
        return;
      }
    } else {
      alert('Usuario no encontrado');
    }
  };

  const handleRegister = (email: string, password: string, name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'guard', // Por defecto se registran como guardas
      createdAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setCurrentView('login');
    alert('Registro exitoso. Por favor inicia sesión.');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      qrCode: userData.role === 'student' ? `QR-STUDENT-${Date.now()}` : undefined,
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleAccessScan = (qrCode: string) => {
    const student = users.find(u => u.qrCode === qrCode);
    if (student && currentUser) {
      const newLog: AccessLog = {
        id: Date.now().toString(),
        userId: student.id,
        userName: student.name,
        timestamp: new Date().toISOString(),
        guardId: currentUser.id,
        guardName: currentUser.name,
        status: 'granted',
      };
      const updatedLogs = [newLog, ...accessLogs];
      setAccessLogs(updatedLogs);
      localStorage.setItem('accessLogs', JSON.stringify(updatedLogs));
      return { success: true, user: student };
    }
    return { success: false, user: null };
  };

  if (currentView === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onSwitchToLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'guard' && currentUser) {
    return (
      <GuardView
        currentUser={currentUser}
        onLogout={handleLogout}
        onAccessScan={handleAccessScan}
        recentLogs={accessLogs.slice(0, 10)}
      />
    );
  }

  if (currentView === 'admin' && currentUser) {
    return (
      <AdminView
        currentUser={currentUser}
        onLogout={handleLogout}
        users={users}
        accessLogs={accessLogs}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
      />
    );
  }

  return null;
}

export default App;
