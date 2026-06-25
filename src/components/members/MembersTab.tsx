import { useMemo, useState, type FormEvent } from 'react';
import { useBandRoster } from '@/hooks/useBandRoster';
import styles from './Members.module.css';

interface Props {
  bandId: string;
  userId: string;
  canManage: boolean;
}

export function MembersTab({ bandId, userId, canManage }: Props) {
  const {
    naipes,
    members,
    naipeMembers,
    myName,
    loading,
    createNaipe,
    setMyNaipe,
    assignNaipe,
    setRole,
    removeMember,
    setMyName,
  } = useBandRoster(bandId, userId);

  const [nameInput, setNameInput] = useState('');
  const [newNaipe, setNewNaipe] = useState('');

  const naipeName = useMemo(() => new Map(naipes.map((n) => [n.id, n.name])), [naipes]);
  const sorted = useMemo(
    () => [...members].sort((a, b) => a.name.localeCompare(b.name)),
    [members],
  );

  async function guard(fn: () => Promise<void>) {
    try {
      await fn();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ocorreu um erro.');
    }
  }

  if (loading) return <div className="content">A carregar membros…</div>;

  const saveName = (e: FormEvent) => {
    e.preventDefault();
    guard(() => setMyName(nameInput));
  };
  const addNaipe = (e: FormEvent) => {
    e.preventDefault();
    if (!newNaipe.trim()) return;
    guard(async () => {
      await createNaipe(newNaipe);
      setNewNaipe('');
    });
  };

  return (
    <div className="content">
      {!myName && (
        <form className="card" onSubmit={saveName}>
          <div className="card-title">Como te chamas?</div>
          <p className={styles.hint}>O teu nome aparece na lista de membros e nos votos.</p>
          <div className="field">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={!nameInput.trim()}>
            Guardar nome
          </button>
        </form>
      )}

      {canManage && (
        <div className="card">
          <div className="card-title">Naipes da banda</div>
          {naipes.length === 0 && <p className={styles.hint}>Ainda não há naipes. Cria o primeiro.</p>}
          {naipes.map((n) => (
            <div key={n.id} className={styles.naipeRow}>
              <span className={styles.naipeName}>{n.name}</span>
              <span className={styles.count}>{(naipeMembers[n.id] ?? new Set()).size} membros</span>
            </div>
          ))}
          <form className={styles.addNaipe} onSubmit={addNaipe}>
            <input
              value={newNaipe}
              onChange={(e) => setNewNaipe(e.target.value)}
              placeholder="Novo naipe (ex: Clarinetes)"
            />
            <button className="btn btn-primary" type="submit" disabled={!newNaipe.trim()}>
              Adicionar
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-title">Membros · {members.length}</div>
        {sorted.map((m) => {
          const isSelf = m.userId === userId;
          const canEditNaipe = isSelf || canManage;
          return (
            <div key={m.userId} className={styles.memberRow}>
              <div className={styles.memberHead}>
                <span className={styles.memberName}>
                  {m.name || 'Sem nome'}
                  {isSelf && <span className={styles.you}> (tu)</span>}
                </span>
                <span className={m.role === 'direcao' ? styles.roleDir : styles.roleMem}>
                  {m.role === 'direcao' ? 'Direção' : 'Membro'}
                </span>
              </div>

              <div className={styles.memberControls}>
                {canEditNaipe ? (
                  <select
                    className={styles.naipeSelect}
                    value={m.naipeId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      guard(() => (isSelf ? setMyNaipe(val) : assignNaipe(m.userId, val)));
                    }}
                  >
                    <option value="">— sem naipe —</option>
                    {naipes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={styles.naipeTag}>
                    {m.naipeId ? naipeName.get(m.naipeId) : 'sem naipe'}
                  </span>
                )}

                {canManage && !isSelf && (
                  <div className={styles.adminBtns}>
                    <button
                      className={styles.smallBtn}
                      onClick={() =>
                        guard(() => setRole(m.userId, m.role === 'direcao' ? 'membro' : 'direcao'))
                      }
                    >
                      {m.role === 'direcao' ? 'Tornar membro' : 'Tornar direção'}
                    </button>
                    <button
                      className={`${styles.smallBtn} ${styles.danger}`}
                      onClick={() => {
                        if (confirm(`Remover ${m.name || 'este membro'} da banda?`)) {
                          guard(() => removeMember(m.userId));
                        }
                      }}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
