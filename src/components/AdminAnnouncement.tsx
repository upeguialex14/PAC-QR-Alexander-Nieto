import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

export default function AdminAnnouncement({ onBack, onSend }: { onBack: () => void; onSend: (msg: string) => void }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return alert('Escribe un mensaje.');
    onSend(message.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Anuncio</CardTitle>
          <CardDescription>Envía un anuncio a todos los usuarios (simulado)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <textarea className="w-full border rounded p-2" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
            <div className="flex gap-3">
              <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">Enviar</Button>
              <Button variant="outline" onClick={onBack}>Volver</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
