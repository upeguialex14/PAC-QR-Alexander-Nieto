import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import type { User, AccessLog } from '../App';

export default function AdminReport({ users, accessLogs, onBack }: { users: User[]; accessLogs: AccessLog[]; onBack: () => void }) {
  const total = users.length;
  const byRole = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentLogs = accessLogs.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Reporte</CardTitle>
          <CardDescription>Resumen rápido de usuarios y accesos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow">
              <h3 className="text-lg">Total Usuarios</h3>
              <p className="text-2xl font-semibold">{total}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="text-lg">Por Rol</h3>
              <ul>
                <li>Estudiantes: {byRole['student'] ?? 0}</li>
                <li>Guardas: {byRole['guard'] ?? 0}</li>
                <li>Administradores: {byRole['admin'] ?? 0}</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <h3 className="text-lg">Accesos hoy</h3>
              <p>{accessLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg mb-2">Logs recientes</h4>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No hay registros</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th>Usuario</th>
                    <th>Guarda</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.userName}</td>
                      <td>{r.guardName}</td>
                      <td>{r.status}</td>
                      <td className="text-sm text-gray-600">{new Date(r.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={onBack}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
