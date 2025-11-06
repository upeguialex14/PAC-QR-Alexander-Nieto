import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { QrCode, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
}

export function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-4 rounded-full">
              <QrCode className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Control de Acceso</CardTitle>
          <CardDescription>
            Sistema de escaneo QR para gestión de accesos
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Usuarios de prueba:</strong>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Admin: admin@sistema.com
              </p>
              <p className="text-xs text-blue-700">
                Guarda: guarda@sistema.com
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
              Iniciar Sesión
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
