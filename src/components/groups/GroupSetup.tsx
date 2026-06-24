import { useState } from 'react';
import styles from './Groups.module.css';

interface GroupSetupProps {
  onCreate: (name: string, member: string) => void;
  onJoin: (code: string, member: string) => boolean;
}

type Mode = null | 'create' | 'join';

export function GroupSetup({ onCreate, onJoin }: GroupSetupProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [member, setMember] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  function handleCreate() {
    if (!name.trim() || !member.trim()) {
      alert('Preenche o teu nome e o nome do grupo.');
      return;
    }
    onCreate(name.trim(), member.trim());
  }

  function handleJoin() {
    if (!code.trim() || !member.trim()) {
      alert('Preenche o teu nome e o código do grupo.');
      return;
    }
    const ok = onJoin(code.toUpperCase().trim(), member.trim());
    if (!ok) {
      alert(
        'Grupo não encontrado neste dispositivo.\n\nNota: sem ligação a servidor, os grupos não são partilhados entre dispositivos.',
      );
    }
  }

  return (
    <div className="card">
      <div className="card-title">👥 Calendário de grupo</div>
      <p className={styles.intro}>
        Cria um grupo para a tua secção (ex: <em>Clarinetes</em>) e partilha o código com os
        colegas. Os dados do grupo ficam guardados localmente neste dispositivo.
      </p>

      <div className={styles.setupBtns}>
        <button className="btn btn-primary" onClick={() => setMode('create')}>
          ＋ Criar grupo
        </button>
        <button className="btn btn-secondary" onClick={() => setMode('join')}>
          🔗 Entrar
        </button>
      </div>

      {mode && (
        <div className={styles.setupPanel}>
          <div className="field">
            <label>O teu nome</label>
            <input
              placeholder="Ex: João Silva"
              value={member}
              onChange={(e) => setMember(e.target.value)}
            />
          </div>

          {mode === 'create' ? (
            <div className="field">
              <label>Nome do grupo</label>
              <input
                placeholder="Ex: Clarinetes"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          ) : (
            <div className="field">
              <label>Código do grupo</label>
              <input
                className={styles.codeInput}
                placeholder="Ex: AB12CD"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
          )}

          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={mode === 'create' ? handleCreate : handleJoin}
            >
              {mode === 'create' ? '＋ Criar' : '🔗 Entrar'}
            </button>
            <button className="btn btn-secondary" onClick={() => setMode(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
