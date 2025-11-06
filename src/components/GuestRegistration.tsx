import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User } from '../App';
import { ArrowLeft } from 'lucide-react';

export default function GuestRegistration({ currentGuard, onBack }: { currentGuard: User; onBack: () => void }) {
  const [name, setName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [host, setHost] = useState('');
  const [reason, setReason] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !host.trim()) {
      alert('Por favor ingresa al menos el nombre del invitado y la persona a visitar.');
      return;
    }

    const reg = {
      id: Date.now().toString(),
      name: name.trim(),
      documentId: documentId.trim(),
      phone: phone.trim(),
      host: host.trim(),
      reason: reason.trim(),
      vehicle: vehicle.trim(),
      guardId: currentGuard.id,
      guardName: currentGuard.name,
      timestamp: new Date().toISOString(),
    };

    try {
      const prev = localStorage.getItem('guestRegistrations');
      const arr = prev ? JSON.parse(prev) : [];
      arr.unshift(reg);
      localStorage.setItem('guestRegistrations', JSON.stringify(arr));

      // Broadcast to other tabs if possible
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('guest-registrations');
          bc.postMessage(reg);
          bc.close();
        } catch (e) {
          // ignore
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // clear form
      setName('');
      setDocumentId('');
      setPhone('');
      setHost('');
      setReason('');
      setVehicle('');
    } catch (e) {
      console.error('No se pudo guardar el registro', e);
      alert('Error al guardar el registro');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Registrar Invitado</CardTitle>
              <CardDescription>Registra visitantes para permitir su ingreso a la sede.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Volver
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div>
              <Label>Nombre del Invitado</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Documento / ID</Label>
              <Input value={documentId} onChange={(e) => setDocumentId(e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Persona a Visitar</Label>
              <Input value={host} onChange={(e) => setHost(e.target.value)} />
            </div>
            <div>
              <Label>Motivo / Observaciones</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div>
              <Label>Vehículo (si aplica)</Label>
              <Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Registrar Invitado</Button>
              <Button variant="outline" onClick={onBack}>Cancelar</Button>
              {saved && <span className="text-sm text-green-700">Registro guardado</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
