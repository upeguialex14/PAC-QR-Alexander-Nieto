import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import type { User } from '../App';

export default function AdminImport({ onBack, onAddUser }: { onBack: () => void; onAddUser: (userData: Omit<User, 'id' | 'createdAt'>) => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) {
        setPreviewCount(0);
        return;
      }
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIdx = header.indexOf('name');
      const emailIdx = header.indexOf('email');
      const roleIdx = header.indexOf('role');
      const qrIdx = header.indexOf('qrcode');
      let added = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const name = nameIdx >= 0 ? cols[nameIdx] : `Imported ${i}`;
        const email = emailIdx >= 0 ? cols[emailIdx] : '';
        const role = (roleIdx >= 0 ? (cols[roleIdx] as any) : 'student') as User['role'];
        const qrCode = qrIdx >= 0 ? cols[qrIdx] : undefined;
        if (email) {
          onAddUser({ name, email, role, qrCode });
          added++;
        }
      }
      setPreviewCount(added);
    };
    reader.readAsText(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : undefined;
    handleFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Usuarios</CardTitle>
          <CardDescription>Sube un CSV con columnas (name,email,role,qrcode). Se añadirán los usuarios con email válido.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <input type="file" accept=".csv,text/csv" onChange={handleInput} />
            {fileName && <p className="text-sm text-gray-600">Archivo: {fileName}</p>}
            {previewCount !== null && <p className="text-sm text-gray-600">Usuarios importados: {previewCount}</p>}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>Volver</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
