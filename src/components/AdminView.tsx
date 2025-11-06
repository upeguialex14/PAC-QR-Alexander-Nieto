import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { User, AccessLog, UserRole } from '../App';
import { 
  Users, 
  LogOut, 
  Shield, 
  UserPlus, 
  Pencil, 
  Trash2,
  Activity,
  QrCode as QrCodeIcon,
  Download,
  Upload,
  FileText,
  RefreshCw,
  Megaphone,
  Menu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AdminExport from './AdminExport';
import AdminImport from './AdminImport';
import AdminReport from './AdminReport';
import AdminResetPasswords from './AdminResetPasswords';
import AdminAnnouncement from './AdminAnnouncement';

interface AdminViewProps {
  currentUser: User;
  onLogout: () => void;
  users: User[];
  accessLogs: AccessLog[];
  onAddUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
}

export function AdminView({
  currentUser,
  onLogout,
  users,
  accessLogs,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}: AdminViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // Persist dashboard visibility so the hamburger button keeps its state across reloads
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  // Collapse state for the buttons row (desktop). Persisted so admin preference is kept.
  const [areButtonsCollapsed, setAreButtonsCollapsed] = useState(false);
  // Internal section state for rendering admin sub-pages inside the panel
  const [activeSection, setActiveSection] = useState<'home' | 'export' | 'import' | 'report' | 'reset' | 'announcement'>('home');

  // Load saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adminDashboardOpen');
      if (saved !== null) {
        setIsDashboardOpen(saved === 'true');
      } else {
        // default: visible on larger screens, closed on small screens; but we default to true
        setIsDashboardOpen(true);
      }
    } catch (e) {
      // ignore (e.g., SSR)
      setIsDashboardOpen(true);
    }
  }, []);

  // Persist preference when changed
  useEffect(() => {
    try {
      localStorage.setItem('adminDashboardOpen', isDashboardOpen ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }, [isDashboardOpen]);

  // Load/save collapse state for buttons
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adminDashboardButtonsCollapsed');
      if (saved !== null) setAreButtonsCollapsed(saved === 'true');
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adminDashboardButtonsCollapsed', areButtonsCollapsed ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }, [areButtonsCollapsed]);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
  });

  const handleAddUser = () => {
    if (newUserData.name && newUserData.email && newUserData.role) {
      onAddUser(newUserData);
      setNewUserData({ name: '', email: '', role: 'student' });
      setIsAddDialogOpen(false);
    }
  };

  // Dashboard button wrappers: call prop if provided or show placeholder
  const handleExportUsers = () => {
    setActiveSection('export');
    // Close dashboard when navigating to a subsection; preference is persisted by the effect
    setIsDashboardOpen(false);
  };

  const handleImportUsers = () => {
    setActiveSection('import');
    setIsDashboardOpen(false);
  };

  const handleGenerateReport = () => {
    setActiveSection('report');
    setIsDashboardOpen(false);
  };

  const handleResetPasswords = () => {
    setActiveSection('reset');
    setIsDashboardOpen(false);
  };

  const handleSendAnnouncement = () => {
    setActiveSection('announcement');
    setIsDashboardOpen(false);
  };

  const handleEditUser = () => {
    if (editingUser) {
      onUpdateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (typeof window !== 'undefined' && window.confirm('¿Estás seguro de eliminar este usuario?')) {
      onDeleteUser(userId);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-600">Administrador</Badge>;
      case 'guard':
        return <Badge className="bg-blue-600">Guarda</Badge>;
      case 'student':
        return <Badge className="bg-green-600">Estudiante</Badge>;
      default:
        return null;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'student').length,
    guards: users.filter(u => u.role === 'guard').length,
    admins: users.filter(u => u.role === 'admin').length,
    todayAccess: accessLogs.filter(log => {
      const today = new Date().toDateString();
      const logDate = new Date(log.timestamp).toDateString();
      return today === logDate;
    }).length,
  };

  // Helper to render the active admin subsection inside the panel
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'export':
        return <AdminExport users={users} onBack={() => setActiveSection('home')} />;
      case 'import':
        return <AdminImport onBack={() => setActiveSection('home')} onAddUser={onAddUser} />;
      case 'report':
        return <AdminReport users={users} accessLogs={accessLogs} onBack={() => setActiveSection('home')} />;
      case 'reset':
        return <AdminResetPasswords users={users} onBack={() => setActiveSection('home')} />;
      case 'announcement':
        return (
          <AdminAnnouncement
            onBack={() => setActiveSection('home')}
            onSend={(msg: string) => {
              const prev = localStorage.getItem('announcements');
              const arr = prev ? JSON.parse(prev) : [];
              arr.unshift({ id: Date.now().toString(), message: msg, createdAt: new Date().toISOString() });
              localStorage.setItem('announcements', JSON.stringify(arr));
              alert('Anuncio enviado');
              setActiveSection('home');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">Panel de Administración</h1>
              <p className="text-sm text-gray-600">{currentUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Hamburger only visible on small screens to toggle dashboard */}
            <Button
              onClick={() => setIsDashboardOpen(prev => !prev)}
              variant="ghost"
              className="md:hidden p-2"
              aria-label="Toggle dashboard"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <Button onClick={onLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard placed directly under header. Visible on md+; on small screens toggled by hamburger */}
      <div className={`${isDashboardOpen ? 'block' : 'hidden'} md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4`}> 
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>panel de Administración</CardTitle>
                <CardDescription>Acciones rápidas para administradores</CardDescription>
              </div>
              {/* Inline toggle: muestra/oculta el dashboard; flecha abajo cuando está oculto, arriba cuando está visible */}
              <div className="hidden md:flex items-center">
                <Button
                  variant="ghost"
                  className="p-2"
                  onClick={() => setIsDashboardOpen(prev => !prev)}
                  aria-label={isDashboardOpen ? 'Ocultar dashboard' : 'Mostrar dashboard'}
                >
                  {isDashboardOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* On mobile show a notice; actual buttons are available only on md+ (desktop)
                This keeps the dashboard visible but disables functionalities on small screens */}
            <div className="md:hidden w-full py-2">
              <div className="rounded bg-yellow-50 border border-yellow-100 px-4 py-3 text-sm text-yellow-800">
                Las acciones del dashboard están disponibles solo en pantallas de computador. Por favor usa un equipo de escritorio para acceder a ellas.
              </div>
            </div>

            {/* Buttons visible and functional only on desktop (md+). Collapsible via header button */}
            <div className={`${areButtonsCollapsed ? 'hidden' : 'flex'} hidden md:flex gap-3 overflow-x-auto py-2`}>
              <Button onClick={handleExportUsers} className="justify-start gap-2 flex-shrink-0 whitespace-nowrap">
                <Download className="w-4 h-4" />
                Exportar Usuarios
              </Button>
              <Button onClick={handleImportUsers} className="justify-start gap-2 flex-shrink-0 whitespace-nowrap">
                <Upload className="w-4 h-4" />
                Importar Usuarios
              </Button>
              <Button onClick={handleGenerateReport} className="justify-start gap-2 flex-shrink-0 whitespace-nowrap">
                <FileText className="w-4 h-4" />
                Generar Reporte
              </Button>
              <Button onClick={handleResetPasswords} className="justify-start gap-2 flex-shrink-0 whitespace-nowrap">
                <RefreshCw className="w-4 h-4" />
                Resetear Contraseñas
              </Button>
              <Button onClick={handleSendAnnouncement} className="justify-start gap-2 flex-shrink-0 whitespace-nowrap">
                <Megaphone className="w-4 h-4" />
                Enviar Anuncio
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Estos botones son estructurales; asigna las funciones desde el contenedor principal (App) cuando las tengas disponibles.</p>
          </CardContent>
        </Card>
      </div>



        {activeSection !== 'home' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderActiveSection()}
          </div>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats grid shown only on the home view to avoid layout issues when a subsection is open */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Usuarios</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Estudiantes</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{stats.students}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Guardas</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{stats.guards}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Administradores</CardDescription>
                  <CardTitle className="text-3xl text-purple-600">{stats.admins}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Accesos Hoy</CardDescription>
                  <CardTitle className="text-3xl text-orange-600">{stats.todayAccess}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  Usuarios
                </TabsTrigger>
                <TabsTrigger value="logs" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Registro de Accesos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Gestión de Usuarios</CardTitle>
                        <CardDescription>
                          Administra usuarios y asigna roles
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Agregar Usuario
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Código QR</TableHead>
                          <TableHead>Fecha Registro</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>
                              {user.qrCode ? (
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {user.qrCode}
                                </code>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDateTime(user.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={user.id === currentUser.id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Registro de Accesos</CardTitle>
                    <CardDescription>
                      Historial completo de accesos al sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {accessLogs.length === 0 ? (
                      <p className="text-center text-gray-500 py-12">
                        No hay registros de acceso aún
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Guarda</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha y Hora</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accessLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>{log.userName}</TableCell>
                              <TableCell>{log.guardName}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={log.status === 'granted' ? 'default' : 'destructive'}
                                  className={log.status === 'granted' ? 'bg-green-600' : ''}
                                >
                                  {log.status === 'granted' ? 'Concedido' : 'Denegado'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {formatDateTime(log.timestamp)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario y asigna un rol
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nombre Completo</Label>
              <Input
                id="add-name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Rol</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value: UserRole) => setNewUserData({ ...newUserData, role: value })}
              >
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="guard">Guarda</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} className="bg-purple-600 hover:bg-purple-700">
              Agregar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre Completo</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: UserRole) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="guard">Guarda</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser.qrCode && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="flex items-center gap-2 mb-2">
                    <QrCodeIcon className="w-4 h-4" />
                    Código QR
                  </Label>
                  <code className="bg-white px-3 py-2 rounded border block">
                    {editingUser.qrCode}
                  </code>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} className="bg-purple-600 hover:bg-purple-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
