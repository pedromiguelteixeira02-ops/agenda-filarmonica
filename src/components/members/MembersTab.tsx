import { useMemo, useState, type FormEvent } from 'react';
import { useBandRoster, type RosterMember } from '@/hooks/useBandRoster';
import styles from './Members.module.css';

interface Props {
  bandId: string;
  userId: string;
  canManage: boolean;
}

const ALL = '__all__';
const NONE = '__none__';
const byName = (a: RosterMember, b: RosterMember) => a.name.localeCompare(b.name);

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
  const [filter, setFilter] = useState<string>(ALL);
  const [editingNaipe, setEditingNaipe] = useState<string | null>(null);

  /** Grupos por naipe (só com membros) + "Sem naipe", para a vista "Todos". */
  const groups = useMemo(() => {
    const result: { key: string; label: string; members: RosterMember[] }[] = [];
    for (const n of naipes) {
      const ms = members.filter((m) => m.naipeId === n.id).sort(byName);
      if (ms.length) result.push({ key: n.id, label: n.name, members: ms });
    }
    const none = members.filter((m) => !m.naipeId).sort(byName);
    if (none.length) result.push({ key: NONE, label: 'Sem naipe', members: none });
    return result;
  }, [naipes, members]);

  const filtered = useMemo(() => {
    const ms = filter === NONE ? members.filter((m) => !m.naipeId) : members.filter((m) => m.naipeId === filter);
    return ms.sort(byName);
  }, [filter, members]);

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

  function renderMember(m: RosterMember) {
    const isSelf = m.userId === userId;
    const canChangeNaipe = isSelf || canManage;
    const editing = editingNaipe === m.userId;

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

        {editing ? (
          <div className={styles.memberControls}>
            <select
              className={styles.naipeSelect}
              autoFocus
              value={m.naipeId ?? ''}
              onChange={(e) => {
                const val = e.target.value || null;
                setEditingNaipe(null);
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
            <button className={styles.smallBtn} onClick={() => setEditingNaipe(null)}>
              Cancelar
            </button>
          </div>
        ) : (
          (canChangeNaipe || canManage) && (
            <div className={styles.memberControls}>
              {canChangeNaipe && (
                <button className={styles.smallBtn} onClick={() => setEditingNaipe(m.userId)}>
                  Mudar naipe
                </button>
              )}
              {canManage && !isSelf && (
                <>
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
                </>
              )}
            </div>
          )
        )}
      </div>
    );
  }

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

        <div className={styles.filterRow}>
          <label htmlFor="memberFilter">Ver:</label>
          <select id="memberFilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value={ALL}>Todos (por naipe)</option>
            {naipes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
            <option value={NONE}>Sem naipe</option>
          </select>
        </div>

        {filter === ALL ? (
          groups.length === 0 ? (
            <p className={styles.hint}>Ainda não há membros.</p>
          ) : (
            groups.map((g) => (
              <div key={g.key}>
                <div className={styles.groupHead}>
                  {g.label} · {g.members.length}
                </div>
                {g.members.map(renderMember)}
              </div>
            ))
          )
        ) : filtered.length === 0 ? (
          <p className={styles.hint}>Ninguém neste naipe.</p>
        ) : (
          filtered.map(renderMember)
        )}
      </div>
    </div>
  );
}
