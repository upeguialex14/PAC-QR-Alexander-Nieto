import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import type { User } from '../App';

export default function AdminExport({ users, onBack }: { users: User[]; onBack: () => void }) {
  const downloadCSV = () => {
    const headers = ['id', 'name', 'email', 'role', 'qrCode', 'createdAt'];
    const rows = users.map(u => [u.id, u.name, u.email, u.role, u.qrCode ?? '', u.createdAt]);
    const csv = [headers, ...rows].map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Exportar Usuarios</CardTitle>
          <CardDescription>Descarga un CSV con todos los usuarios registrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={downloadCSV} className="bg-purple-600 hover:bg-purple-700">
              Descargar CSV
            </Button>
            <Button variant="outline" onClick={onBack}>Volver</Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">Usuarios a exportar: {users.length}</p>
        </CardContent>
      </Card>
    </div>
  );
}
