import {
  footballApiConfig,
  isFootballApiConfigured,
} from '@/config/footballApi';

type FootballApiResult = {
  ok: boolean;
  message: string;
  liveMatchesCount?: number;
};

export type SportMonksLiveMatchSummary = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  status: string;
};

function buildSportMonksUrl(path: string) {
  const url = new URL(`${footballApiConfig.baseUrl}${path}`);

  url.searchParams.append('api_token', footballApiConfig.apiKey);

  return url;
}

function getParticipantName(match: any, location: 'home' | 'away') {
  const participant = match?.participants?.find(
    (item: any) => item?.meta?.location === location
  );

  return participant?.name ?? (location === 'home' ? 'Local' : 'Visitante');
}

function mapSportMonksLiveMatch(match: any): SportMonksLiveMatchSummary {
  return {
    id: String(match?.id ?? ''),
    homeTeam: getParticipantName(match, 'home'),
    awayTeam: getParticipantName(match, 'away'),
    leagueName: match?.league?.name ?? 'Liga no disponible',
    status: match?.state?.name ?? 'En vivo',
  };
}

export async function getSportMonksInplayMatches() {
  const url = buildSportMonksUrl('/livescores/inplay');

  url.searchParams.append(
    'include',
    'participants;scores;periods;events;league.country;round;state'
  );

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `SportMonks respondió con error ${response.status}. Revisa tu token o tu plan.`
    );
  }

  return Array.isArray(data?.data) ? data.data : [];
}

export async function getSportMonksInplayMatchSummaries() {
  const liveMatches = await getSportMonksInplayMatches();

  return liveMatches.map(mapSportMonksLiveMatch);
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
    const liveMatches = await getSportMonksInplayMatches();

    return {
      ok: true,
      liveMatchesCount: liveMatches.length,
      message: `Conexión real exitosa con SportMonks. Partidos en vivo encontrados: ${liveMatches.length}.`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'No se pudo conectar con SportMonks.';

    return {
      ok: false,
      message: errorMessage,
    };
  }
}