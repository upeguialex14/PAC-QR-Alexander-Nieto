import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import type { User } from '../App';

export default function AdminResetPasswords({ users, onBack }: { users: User[]; onBack: () => void }) {
  const handleReset = (user: User) => {
    // simulate reset
    alert(`Contraseña reseteada para ${user.name} (${user.email})`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Resetear Contraseñas</CardTitle>
          <CardDescription>Resetea contraseñas de usuarios (simulado)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2 bg-white rounded">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
                <div>
                  <Button onClick={() => handleReset(u)} variant="outline">Resetear</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button variant="outline" onClick={onBack}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
