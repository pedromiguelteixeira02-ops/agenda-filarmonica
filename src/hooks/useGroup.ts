import { useCallback, useState } from 'react';
import type { Group, VoteValue } from '@/types';
import { repo } from '@/lib/storage';

interface GroupState {
  code: string;
  member: string;
  group: Group | null;
}

function initialState(): GroupState {
  const { code, member } = repo.getSession();
  return { code, member, group: code ? repo.getGroup(code) : null };
}

/**
 * Gere a sessão de grupo (código + membro) e os votos.
 * Tudo continua local via `repo`; substituível por backend sem mexer na UI.
 */
export function useGroup() {
  const [state, setState] = useState<GroupState>(initialState);

  const createGroup = useCallback((name: string, member: string) => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const group: Group = { name, code, members: [member], votes: {} };
    repo.saveGroup(group);
    repo.setSession(code, member);
    setState({ code, member, group });
  }, []);

  /** Tenta entrar num grupo existente. Devolve false se não existir. */
  const joinGroup = useCallback((code: string, member: string): boolean => {
    const group = repo.getGroup(code);
    if (!group) return false;
    if (!group.members.includes(member)) {
      group.members.push(member);
      repo.saveGroup(group);
    }
    repo.setSession(code, member);
    setState({ code, member, group });
    return true;
  }, []);

  const castVote = useCallback(
    (eventId: string, vote: VoteValue) => {
      setState((prev) => {
        if (!prev.group || !prev.member) return prev;
        const group: Group = {
          ...prev.group,
          votes: {
            ...prev.group.votes,
            [eventId]: { ...prev.group.votes[eventId], [prev.member]: vote },
          },
        };
        repo.saveGroup(group);
        return { ...prev, group };
      });
    },
    [],
  );

  const leaveGroup = useCallback(() => {
    repo.clearSession();
    setState({ code: '', member: '', group: null });
  }, []);

  return {
    code: state.code,
    member: state.member,
    group: state.group,
    createGroup,
    joinGroup,
    castVote,
    leaveGroup,
  };
}
