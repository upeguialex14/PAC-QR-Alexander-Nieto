import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, AccessLog } from '../App';
import { QrCode, LogOut, Camera, CheckCircle, XCircle, Clock, UserPlus } from 'lucide-react';
import GuestRegistration from './GuestRegistration';
import { Alert, AlertDescription } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface GuardViewProps {
  currentUser: User;
  onLogout: () => void;
  onAccessScan: (qrCode: string) => { success: boolean; user: User | null };
  recentLogs: AccessLog[];
}

export function GuardView({ currentUser, onLogout, onAccessScan, recentLogs }: GuardViewProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [manualQrCode, setManualQrCode] = useState('');
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSent, setAlertSent] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'register'>('home');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsScanning(true);
      setScanResult(null);
    } catch (error) {
      alert('No se pudo acceder a la cámara. Por favor, permite el acceso a la cámara.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualScan = () => {
    if (manualQrCode.trim()) {
      const result = onAccessScan(manualQrCode.trim());
      if (result.success && result.user) {
        setScanResult({
          success: true,
          message: `Acceso concedido a ${result.user.name}`,
        });
      } else {
        setScanResult({
          success: false,
          message: 'Código QR no válido',
        });
      }
      setManualQrCode('');
      setTimeout(() => setScanResult(null), 5000);
    }
  };

  const sendGuardAlert = (message: string) => {
    const alertObj = {
      id: Date.now().toString(),
      guardId: currentUser.id,
      guardName: currentUser.name,
      message: message || 'Alerta desde guarda',
      timestamp: new Date().toISOString(),
      status: 'new',
    };

    try {
      // Save to localStorage (history)
      const prev = localStorage.getItem('guardAlerts');
      const arr = prev ? JSON.parse(prev) : [];
      arr.unshift(alertObj);
      localStorage.setItem('guardAlerts', JSON.stringify(arr));

      // Try to notify other tabs (AdminView) immediately
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('qr-scanner-alerts');
          bc.postMessage(alertObj);
          bc.close();
        } catch (e) {
          // ignore broadcast errors
        }
      }

      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 3000);
    } catch (e) {
      console.error('No se pudo enviar la alerta', e);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">Vista de Guarda</h1>
              <p className="text-sm text-gray-600">{currentUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAlertDialogOpen(true)}
              className="bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-700 gap-2 px-3 py-2 flex items-center"
              title="Enviar alerta al administrador"
              aria-label="Enviar alerta al administrador"
            >
              <span className="mr-2 text-lg" aria-hidden="true">🚨</span>
              <AlertTriangle className="w-4 h-4 text-white" />
              <span className="ml-1">Enviar Alerta</span>
            </Button>
            <Button
              onClick={() => setActiveView('register')}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-blue-700 gap-2 px-3 py-2 flex items-center"
              title="Registrar invitado"
              aria-label="Registrar invitado"
            >
              <UserPlus className="w-4 h-4 text-white mr-2" />
              Registrar Invitado
            </Button>
            <Button onClick={onLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {activeView === 'register' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GuestRegistration currentGuard={currentUser} onBack={() => setActiveView('home')} />
        </div>
      )}
      {activeView === 'home' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Escanear Código QR
                </CardTitle>
                <CardDescription>
                  Usa la cámara o ingresa el código manualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isScanning ? (
                  <Button 
                    onClick={startCamera}
                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Activar Cámara
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 border-4 border-green-500 rounded-lg m-8 pointer-events-none" />
                    </div>
                    <Button 
                      onClick={stopCamera}
                      variant="outline"
                      className="w-full"
                    >
                      Detener Cámara
                    </Button>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O ingresa manualmente</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualQrCode}
                    onChange={(e) => setManualQrCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                    placeholder="QR-STUDENT-001"
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <Button onClick={handleManualScan} className="bg-green-600 hover:bg-green-700">
                    Verificar
                  </Button>
                </div>

                {scanResult && (
                  <Alert className={scanResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                    <div className="flex items-center gap-2">
                      {scanResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <AlertDescription className={scanResult.success ? 'text-green-900' : 'text-red-900'}>
                        {scanResult.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
                {alertSent && (
                  <Alert className="border-red-500 bg-red-50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <AlertDescription className="text-red-900">Alerta enviada al administrador</AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Accesos Recientes
                </CardTitle>
                <CardDescription>
                  Últimos escaneos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLogs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay registros aún
                    </p>
                  ) : (
                    recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p>{log.userName}</p>
                            <Badge 
                              variant={log.status === 'granted' ? 'default' : 'destructive'}
                              className={log.status === 'granted' ? 'bg-green-600' : ''}
                            >
                              {log.status === 'granted' ? 'Concedido' : 'Denegado'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            Por: {log.guardName}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p>{formatTime(log.timestamp)}</p>
                          <p className="text-xs">{formatDate(log.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
  </main>
  )}

  <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Alerta</DialogTitle>
            <DialogDescription>
              Describe brevemente el problema que quieres notificar al administrador.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="w-full p-2 border rounded-md min-h-[100px]"
              placeholder="Ej: hay una persona sospechosa en la entrada..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAlertDialogOpen(false); setAlertMessage(''); }}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                sendGuardAlert(alertMessage);
                setIsAlertDialogOpen(false);
                setAlertMessage('');
              }}
            >
              Enviar Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
