import teamsData from '../data/teams.json';
import type { Team, TeamId } from '../types/domain';

const teams = teamsData.teams as Team[];

const byId = new Map<TeamId, Team>(teams.map((t) => [t.id, t]));

export function getTeam(id: TeamId | null | undefined): Team | null {
  if (!id) return null;
  return byId.get(id) ?? null;
}

export function getAllTeams(): Team[] {
  return teams;
}

export function teamName(id: TeamId | null | undefined): string {
  if (!id) return '—';
  return byId.get(id)?.name ?? id;
}

export function teamCode(id: TeamId | null | undefined): string {
  if (!id) return '';
  return byId.get(id)?.code ?? id;
}

export function teamFlag(id: TeamId | null | undefined): string {
  if (!id) return '';
  return byId.get(id)?.flag ?? '';
}
