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
</div>
<table><thead>
  <tr><th>Data</th><th>Evento</th><th>Tipo</th><th>Banda</th><th>Local</th><th>Horário</th><th>Banda convidada</th></tr>
</thead><tbody>${rows}</tbody></table>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),400));<\/script>
</body></html>`;

  openPrint(html, 'agenda_filarmonica.html');
}

/** Abre o HTML numa janela que imprime (guardar como PDF); fallback para download. */
function openPrint(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export interface AttendanceEventExport {
  name: string;
  date: string;
  location: string;
  sim: string[];
  nao: string[];
  talvez: string[];
  pendente: string[];
}

function col(title: string, names: string[], cls: string): string {
  const body = names.length
    ? `<ul>${names.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`
    : '<div class="none">—</div>';
  return `<div class="col ${cls}"><div class="col-h">${title} (${names.length})</div>${body}</div>`;
}

/** Exporta a assiduidade (por âmbito: banda toda ou um naipe) para PDF. */
export function exportAttendancePDF(opts: { scope: string; events: AttendanceEventExport[] }): void {
  const blocks = opts.events
    .map(
      (ev) => `
    <div class="ev">
      <div class="ev-head">
        <span class="ev-date">${fmtD(ev.date)}</span>
        <span class="ev-name">${esc(ev.name || '—')}</span>
        ${ev.location ? `<span class="ev-loc">· ${esc(ev.location)}</span>` : ''}
      </div>
      <div class="cols">
        ${col('✓ Vão', ev.sim, 'g')}
        ${col('✗ Não vão', ev.nao, 'r')}
        ${col('? Talvez', ev.talvez, 'a')}
        ${ev.pendente.length ? col('· Por votar', ev.pendente, 'm') : ''}
      </div>
    </div>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"><title>Assiduidade — Agenda Filarmónica</title>
<style>
*{box-sizing:border-box}
body{font-family:Arial,sans-serif;margin:24px;color:#1a202c}
h1{color:#185FA5;font-size:20px;margin-bottom:2px}
.meta{color:#718096;font-size:11px;margin-bottom:16px}
.scope{display:inline-block;background:#e6f1fb;color:#185FA5;font-weight:700;font-size:12px;padding:3px 10px;border-radius:10px;margin-bottom:16px}
.ev{border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:10px;page-break-inside:avoid}
.ev-head{display:flex;align-items:baseline;gap:8px;margin-bottom:8px;border-bottom:1px solid #edf2f7;padding-bottom:6px}
.ev-date{font-weight:700;color:#185FA5;font-size:12px}
.ev-name{font-weight:700;font-size:13px}
.ev-loc{color:#718096;font-size:11px}
.cols{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.col-h{font-size:11px;font-weight:700;margin-bottom:4px}
.col.g .col-h{color:#0a6641}.col.r .col-h{color:#943515}.col.a .col-h{color:#7a4600}.col.m .col-h{color:#718096}
ul{margin:0;padding-left:16px}
li{font-size:11px;line-height:1.5}
.none{font-size:11px;color:#a0aec0}
</style></head><body>
<h1>🎼 Assiduidade</h1>
<p class="meta">Exportado em ${new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<div class="scope">${esc(opts.scope)}</div>
${blocks || '<p style="color:#718096;font-size:12px">Sem eventos futuros.</p>'}
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),400));<\/script>
</body></html>`;

  openPrint(html, 'assiduidade.html');
}
