import {
  footballApiConfig,
  isFootballApiConfigured,
} from '@/config/footballApi';

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
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function mapFootballDataMatch(match: any): FootballDataMatchSummary {
  return {
    id: String(match?.id ?? ''),
    homeTeam: match?.homeTeam?.name ?? 'Local',
    awayTeam: match?.awayTeam?.name ?? 'Visitante',
    competitionName: match?.competition?.name ?? 'Competición no disponible',
    startingAt: formatFootballDataDate(match?.utcDate),
    status: formatFootballDataStatus(match?.status),
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