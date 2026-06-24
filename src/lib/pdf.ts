import type { AgendaEvent } from '@/types';
import { fmtD } from './date';

/** Escapa texto para interpolação segura no HTML do documento de impressão. */
function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

/**
 * Gera um documento HTML com a tabela completa de eventos e abre-o numa nova
 * janela que dispara `window.print()` (o utilizador escolhe "Guardar como PDF").
 * Fallback para download do .html se o popup for bloqueado.
 */
export function exportPDF(events: AgendaEvent[]): void {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const totalV = events.reduce((a, e) => a + Number(e.value || 0), 0);
  const totalS = events.filter((e) => e.type === 'Serviço').length;
  const totalR = events.filter((e) => e.type === 'Ensaio').length;

  const rows = sorted
    .map(
      (ev) => `
    <tr>
      <td>${fmtD(ev.date)}</td>
      <td><strong>${esc(ev.name || '—')}</strong></td>
      <td>${ev.type}</td>
      <td>${esc(ev.band)}</td>
      <td>${esc(ev.location || '—')}</td>
      <td>${ev.start || '—'}${ev.end ? ' – ' + ev.end : ''}</td>
      <td style="color:#534AB7;font-style:italic">${esc(ev.secondBand || '—')}</td>
      <td style="text-align:right;font-weight:700;color:#0a6641">€${Number(ev.value || 0).toFixed(0)}</td>
    </tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"><title>Agenda Filarmónica</title>
<style>
*{box-sizing:border-box}
body{font-family:Arial,sans-serif;margin:24px;font-size:11px;color:#1a202c}
h1{color:#185FA5;font-size:20px;margin-bottom:4px}
.meta{color:#718096;font-size:11px;margin-bottom:8px}
.summary{display:flex;gap:16px;margin-bottom:20px;padding:10px 14px;background:#f0f4f8;border-radius:8px}
.s-val{font-size:20px;font-weight:700}.s-val.g{color:#0a6641}.s-val.b{color:#185FA5}
.s-label{font-size:10px;color:#718096}
table{width:100%;border-collapse:collapse}
th{background:#185FA5;color:#fff;padding:6px 8px;text-align:left;font-size:10px;font-weight:700}
td{padding:5px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;vertical-align:top}
tr:nth-child(even) td{background:#f7fafc}
.footer{margin-top:16px;display:flex;justify-content:flex-end;align-items:center;gap:16px;border-top:2px solid #185FA5;padding-top:10px}
</style></head><body>
<h1>🎼 Agenda Filarmónica</h1>
<p class="meta">Exportado em ${new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<div class="summary">
  <div><div class="s-val b">${totalS}</div><div class="s-label">Serviços</div></div>
  <div><div class="s-val">${totalR}</div><div class="s-label">Ensaios</div></div>
  <div><div class="s-val g">€${totalV.toFixed(2)}</div><div class="s-label">Total recebido</div></div>
</div>
<table><thead>
  <tr><th>Data</th><th>Evento</th><th>Tipo</th><th>Banda</th><th>Local</th><th>Horário</th><th>Banda convidada</th><th>Valor</th></tr>
</thead><tbody>${rows}</tbody></table>
<div class="footer">
  <span style="font-size:13px;color:#718096">Total acumulado</span>
  <span style="font-size:20px;font-weight:700;color:#0a6641">€${totalV.toFixed(2)}</span>
</div>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),400));<\/script>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agenda_filarmonica.html';
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
