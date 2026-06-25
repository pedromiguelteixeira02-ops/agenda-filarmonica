import { useState } from 'react';
import type { PersonalEvent } from '@/lib/personalApi';
import { todayStr } from '@/lib/date';
import styles from './Personal.module.css';

interface Props {
  event: PersonalEvent | null;
  defaultDate?: string;
  onSave: (data: Omit<PersonalEvent, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function PersonalEventModal({ event, defaultDate, onSave, onDelete, onClose }: Props) {
  const [form, setForm] = useState(() => ({
    name: event?.name ?? '',
    band: event?.band ?? '',
    date: event?.date ?? defaultDate ?? todayStr,
    start: event?.start ?? '',
    end: event?.end ?? '',
    location: event?.location ?? '',
    value: String(event?.value ?? 0),
    paid: event?.paid ?? false,
    notes: event?.notes ?? '',
  }));

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    if (!form.date) {
      alert('Insere uma data.');
      return;
    }
    onSave({
      name: form.name.trim(),
      band: form.band.trim(),
      date: form.date,
      start: form.start,
      end: form.end,
      location: form.location.trim(),
      value: Number(form.value || 0),
      paid: form.paid,
      notes: form.notes.trim(),
    });
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.box}>
        <div className={styles.boxHeader}>
          <span className={styles.boxTitle}>{event ? 'Editar evento' : 'Novo evento pessoal'}</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="field">
          <label>Nome</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Casamento" />
        </div>

        <div className="field">
          <label>Banda / Filarmónica (opcional)</label>
          <input
            value={form.band}
            onChange={(e) => set('band', e.target.value)}
            placeholder="Ex: Filarmónica de Aveiro"
          />
        </div>

        <div className="field">
          <label>Data</label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>

        <div className="row2">
          <div className="field">
            <label>Hora início</label>
            <input type="time" value={form.start} onChange={(e) => set('start', e.target.value)} />
          </div>
          <div className="field">
            <label>Hora fim</label>
            <input type="time" value={form.end} onChange={(e) => set('end', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Localização</label>
          <input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Ex: Aveiro"
          />
        </div>

        <div className="field">
          <label>Valor recebido (€) — privado</label>
          <input
            type="number"
            min="0"
            step="5"
            inputMode="decimal"
            value={form.value}
            onChange={(e) => set('value', e.target.value)}
          />
        </div>

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={form.paid}
            onChange={(e) => setForm((f) => ({ ...f, paid: e.target.checked }))}
          />
          Já recebi este valor
        </label>

        <div className="field">
          <label>Notas</label>
          <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={save}>
            💾 Guardar
          </button>
          {event && (
            <button className="btn btn-danger" onClick={() => onDelete(event.id)}>
              🗑 Apagar
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
