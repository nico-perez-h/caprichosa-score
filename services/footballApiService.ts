import {
  footballApiConfig,
  isFootballApiConfigured,
} from '@/config/footballApi';
import type { Match, MatchStatus } from '@/types/match';

type FootballApiResult = {
  ok: boolean;
  message: string;
  matchesCount?: number;
};

export type FootballDataMatchSummary = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competitionName: string;
  startingAt: string;
  status: string;
};

function buildFootballDataUrl(path: string) {
  return new URL(`${footballApiConfig.baseUrl}${path}`);
}

function formatFootballDataStatus(status: string) {
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'En vivo';
  if (status === 'TIMED' || status === 'SCHEDULED') return 'Por jugar';
  if (status === 'FINISHED') return 'Finalizado';
  if (status === 'POSTPONED') return 'Postergado';
  if (status === 'CANCELLED') return 'Cancelado';

  return status || 'Estado no disponible';
}

function mapFootballDataStatusToMatchStatus(status: string): MatchStatus {
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'En vivo';
  if (status === 'FINISHED') return 'Finalizado';

  return 'Por jugar';
}

function formatFootballDataDate(utcDate: string) {
  if (!utcDate) return 'Fecha no disponible';

  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatFootballDataTime(utcDate: string) {
  if (!utcDate) return 'Hora no disponible';

  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) {
    return 'Hora no disponible';
  }

  return new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatFootballDataDateTime(utcDate: string) {
  if (!utcDate) return 'Fecha no disponible';

  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getScoreValue(value: unknown) {
  return typeof value === 'number' ? value : undefined;
}

function getTournamentIdFromCompetition(competitionName: string) {
  const normalizedCompetitionName = competitionName.toLowerCase();

  if (normalizedCompetitionName.includes('world cup')) {
    return 'world-cup-2026';
  }

  if (normalizedCompetitionName.includes('champions league')) {
    return 'champions-league';
  }

  if (normalizedCompetitionName.includes('premier league')) {
    return 'premier-league';
  }

  if (normalizedCompetitionName.includes('libertadores')) {
    return 'libertadores';
  }

  return 'football-data';
}

function mapFootballDataMatch(match: any): FootballDataMatchSummary {
  return {
    id: String(match?.id ?? ''),
    homeTeam: match?.homeTeam?.name ?? 'Local',
    awayTeam: match?.awayTeam?.name ?? 'Visitante',
    competitionName: match?.competition?.name ?? 'Competición no disponible',
    startingAt: formatFootballDataDateTime(match?.utcDate),
    status: formatFootballDataStatus(match?.status),
  };
}

function mapFootballDataMatchToAppMatch(match: any): Match {
  const competitionName =
    match?.competition?.name ?? 'Competición no disponible';

  const actualHomeScore = getScoreValue(match?.score?.fullTime?.home);
  const actualAwayScore = getScoreValue(match?.score?.fullTime?.away);

  return {
    id: String(match?.id ?? ''),
    tournamentId: getTournamentIdFromCompetition(competitionName),
    homeTeam: match?.homeTeam?.name ?? 'Local',
    awayTeam: match?.awayTeam?.name ?? 'Visitante',
    date: formatFootballDataDate(match?.utcDate),
    kickoffTime: formatFootballDataTime(match?.utcDate),
    tournament: competitionName,
    group: match?.group ?? match?.stage ?? 'Fase no disponible',
    stadium: 'Estadio no disponible',
    city: 'Ciudad no disponible',
    status: mapFootballDataStatusToMatchStatus(match?.status),
    actualHomeScore,
    actualAwayScore,
  };
}

async function fetchFootballData(path: string) {
  const url = buildFootballDataUrl(path);

  const response = await fetch(url.toString(), {
    headers: {
      'X-Auth-Token': footballApiConfig.apiKey,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Football-Data respondió con error ${response.status}. Revisa tu token o tu plan.`
    );
  }

  return data;
}

export async function getFootballDataTodayMatches() {
  const data = await fetchFootballData('/matches');
  const matches = Array.isArray(data?.matches) ? data.matches : [];

  return matches.map(mapFootballDataMatch);
}

export async function getFootballDataTodayAppMatches(): Promise<Match[]> {
  const data = await fetchFootballData('/matches');
  const matches = Array.isArray(data?.matches) ? data.matches : [];

  return matches.map(mapFootballDataMatchToAppMatch);
}

export async function testFootballApiConnection(): Promise<FootballApiResult> {
  if (!isFootballApiConfigured()) {
    return {
      ok: false,
      message:
        'La API de fútbol todavía no está configurada. Falta agregar la URL base y la API key.',
    };
  }

  try {
    const matches = await getFootballDataTodayMatches();

    return {
      ok: true,
      matchesCount: matches.length,
      message: `Conexión real exitosa con ${footballApiConfig.provider}. Partidos encontrados hoy: ${matches.length}.`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'No se pudo conectar con Football-Data.org.';

    return {
      ok: false,
      message: errorMessage,
    };
  }
}