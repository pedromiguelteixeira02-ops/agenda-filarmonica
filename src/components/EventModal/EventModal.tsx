import { useState } from 'react';
import type { AgendaEvent, EventType } from '@/types';
import { BANDS } from '@/data/constants';
import modalStyles from './EventModal.module.css';

interface EventModalProps {
  /** Evento a editar, ou null para criar um novo. */
  event: AgendaEvent | null;
  /** Data pré-preenchida ao criar (ISO yyyy-mm-dd). */
  defaultDate: string;
  onSave: (data: Omit<AgendaEvent, 'id'> & { id?: string | null }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  /** Quando true, o evento é apenas visualizável (membros sem permissão de gestão). */
  readOnly?: boolean;
}

const KNOWN_BAND_NAMES = BANDS.map((b) => b.name);

interface FormState {
  band: string;
  customBand: string;
  type: EventType;
  name: string;
  date: string;
  start: string;
  end: string;
  location: string;
  secondBand: string;
  value: string;
  notes: string;
}

function initForm(event: AgendaEvent | null, defaultDate: string): FormState {
  if (!event) {
    return {
      band: BANDS[0].name,
      customBand: '',
      type: 'Serviço',
      name: '',
      date: defaultDate,
      start: '',
      end: '',
      location: '',
      secondBand: '',
      value: '0',
      notes: '',
    };
  }
  const known = KNOWN_BAND_NAMES.includes(event.band);
  return {
    band: known ? event.band : 'Outros',
    customBand: known ? '' : event.band,
    type: event.type,
    name: event.name ?? '',
    date: event.date,
    start: event.start ?? '',
    end: event.end ?? '',
    location: event.location ?? '',
    secondBand: event.secondBand ?? '',
    value: String(event.value ?? 0),
    notes: event.notes ?? '',
  };
}

export function EventModal({
  event,
  defaultDate,
  onSave,
  onDelete,
  onClose,
  readOnly = false,
}: EventModalProps) {
  const [form, setForm] = useState<FormState>(() => initForm(event, defaultDate));
  const isEditing = event !== null;

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const showCustomBand = form.band === 'Outros';

  function handleSave() {
    if (!form.date) {
      alert('Por favor insere uma data.');
      return;
    }
    const band = showCustomBand ? form.customBand.trim() || 'Outros' : form.band;
    onSave({
      id: event?.id ?? null,
      band,
      type: form.type,
      name: form.name.trim(),
      date: form.date,
      start: form.start,
      end: form.end,
      location: form.location.trim(),
      secondBand: form.secondBand.trim(),
      value: Number(form.value || 0),
      notes: form.notes.trim(),
    });
  }

  function handleDelete() {
    if (!event) return;
    if (!confirm('Apagar este evento? Esta acção não pode ser desfeita.')) return;
    onDelete(event.id);
  }

  return (
    <ModalShell
      title={readOnly ? 'Evento' : isEditing ? 'Editar Evento' : 'Novo Evento'}
      onClose={onClose}
    >
      <fieldset disabled={readOnly} style={{ border: 'none', padding: 0, margin: 0 }}>
      <div className="field">
        <label>Banda</label>
        <select value={form.band} onChange={(e) => set('band', e.target.value)}>
          {BANDS.map((b) => (
            <option key={b.name}>{b.name}</option>
          ))}
        </select>
      </div>

      {showCustomBand && (
        <div className="field">
          <label>Nome da banda</label>
          <input
            placeholder="Nome da banda"
            value={form.customBand}
            onChange={(e) => set('customBand', e.target.value)}
          />
        </div>
      )}

      <div className="field">
        <label>Tipo</label>
        <select value={form.type} onChange={(e) => set('type', e.target.value as EventType)}>
          <option>Serviço</option>
          <option>Ensaio</option>
        </select>
      </div>

      <div className="field">
        <label>Nome do evento / festa</label>
        <input
          placeholder="Ex: Santo António"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
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
          placeholder="Ex: Vale de Cambra"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
        />
      </div>

      <div className="field">
        <label>Banda convidada (opcional)</label>
        <input
          placeholder="Segunda banda"
          value={form.secondBand}
          onChange={(e) => set('secondBand', e.target.value)}
        />
      </div>

      <div className="field">
        <label>Valor recebido (€)</label>
        <input
          type="number"
          min="0"
          step="5"
          value={form.value}
          onChange={(e) => set('value', e.target.value)}
        />
      </div>

      <div className="field">
        <label>Notas</label>
        <textarea
          rows={2}
          placeholder="Observações..."
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      </fieldset>

      <div className="btn-row">
        {!readOnly && (
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Guardar
          </button>
        )}
        {!readOnly && isEditing && (
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑 Apagar
          </button>
        )}
        <button className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
      </div>
    </ModalShell>
  );
}

/* Casca do modal (overlay + caixa) — fecha ao clicar fora. */
function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={modalStyles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={modalStyles.box}>
        <div className={modalStyles.header}>
          <span className={modalStyles.title}>{title}</span>
          <button className={modalStyles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
