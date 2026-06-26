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

export type WorldCup2026MatchSummary = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  startingAt: string;
  status: string;
};

type WorldCup2026Stadium = {
  id?: string;
  name_en?: string;
  fifa_name?: string;
  city_en?: string;
  country_en?: string;
};

type WorldCup2026Team = {
  id?: string;
  name_en?: string;
  flag?: string;
  fifa_code?: string;
  iso2?: string;
  group?: string;
};

function buildWorldCupApiUrl(path: string) {
  return new URL(`${footballApiConfig.baseUrl}${path}`);
}

function normalizeBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return false;
}

function getScoreValue(value: unknown) {
  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    const parsedValue = Number(value);

    if (!Number.isNaN(parsedValue)) {
      return parsedValue;
    }
  }

  return undefined;
}

function mapWorldCupStatusToMatchStatus(game: any): MatchStatus {
  const isFinished = normalizeBoolean(game?.finished);
  const timeElapsed = String(game?.time_elapsed ?? '').toLowerCase();

  if (isFinished) return 'Finalizado';

  if (
    timeElapsed &&
    timeElapsed !== 'notstarted' &&
    timeElapsed !== 'not started'
  ) {
    return 'En vivo';
  }

  return 'Por jugar';
}

function formatWorldCupStatus(game: any) {
  const matchStatus = mapWorldCupStatusToMatchStatus(game);

  if (matchStatus === 'Por jugar') return 'Por jugar';
  if (matchStatus === 'En vivo') return 'En vivo';
  return 'Finalizado';
}

function parseWorldCupDate(localDate: string) {
  if (!localDate) return null;

  const [datePart, timePart] = localDate.split(' ');

  if (!datePart || !timePart) return null;

  const [month, day, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');

  if (!month || !day || !year || !hour || !minute) return null;

  return {
    day: day.padStart(2, '0'),
    month: month.padStart(2, '0'),
    year,
    hour: hour.padStart(2, '0'),
    minute: minute.padStart(2, '0'),
  };
}

function formatWorldCupDate(localDate: string) {
  const parsedDate = parseWorldCupDate(localDate);

  if (!parsedDate) return 'Fecha no disponible';

  return `${parsedDate.day}/${parsedDate.month}/${parsedDate.year}`;
}

function formatWorldCupTime(localDate: string) {
  const parsedDate = parseWorldCupDate(localDate);

  if (!parsedDate) return 'Hora no disponible';

  return `${parsedDate.hour}:${parsedDate.minute}`;
}

function formatWorldCupDateTime(localDate: string) {
  const parsedDate = parseWorldCupDate(localDate);

  if (!parsedDate) return 'Fecha no disponible';

  return `${parsedDate.day}/${parsedDate.month}/${parsedDate.year} · ${parsedDate.hour}:${parsedDate.minute}`;
}

function getTeamName(game: any, side: 'home' | 'away') {
  const teamName = game?.[`${side}_team_name_en`];
  const teamLabel = game?.[`${side}_team_label`];

  return teamName ?? teamLabel ?? (side === 'home' ? 'Local' : 'Visitante');
}

function getTeamId(game: any, side: 'home' | 'away') {
  return game?.[`${side}_team_id`];
}

function getStageName(game: any) {
  const type = String(game?.type ?? '').toLowerCase();

  if (type === 'group') {
    return game?.group ? `Grupo ${game.group}` : 'Fase de grupos';
  }

  if (type === 'r32') return 'Dieciseisavos';
  if (type === 'r16') return 'Octavos de final';
  if (type === 'qf') return 'Cuartos de final';
  if (type === 'sf') return 'Semifinal';
  if (type === 'third') return 'Tercer lugar';
  if (type === 'final') return 'Final';

  return game?.group ?? 'Fase no disponible';
}

function getStadiumById(
  stadiums: WorldCup2026Stadium[],
  stadiumId: string | number | undefined
) {
  return stadiums.find((stadium) => String(stadium.id) === String(stadiumId));
}

function getTeamById(
  teams: WorldCup2026Team[],
  teamId: string | number | undefined
) {
  return teams.find((team) => String(team.id) === String(teamId));
}

function getTeamByName(teams: WorldCup2026Team[], teamName: string) {
  const cleanTeamName = teamName.trim().toLowerCase();

  return teams.find(
    (team) => team.name_en?.trim().toLowerCase() === cleanTeamName
  );
}

function getTeamData(
  teams: WorldCup2026Team[],
  game: any,
  side: 'home' | 'away'
) {
  const teamId = getTeamId(game, side);
  const teamName = getTeamName(game, side);

  return getTeamById(teams, teamId) ?? getTeamByName(teams, teamName);
}

function mapWorldCupGameToSummary(game: any): WorldCup2026MatchSummary {
  return {
    id: String(game?.id ?? ''),
    homeTeam: getTeamName(game, 'home'),
    awayTeam: getTeamName(game, 'away'),
    group: getStageName(game),
    startingAt: formatWorldCupDateTime(game?.local_date),
    status: formatWorldCupStatus(game),
  };
}

function mapWorldCupGameToAppMatch({
  game,
  stadiums,
  teams,
}: {
  game: any;
  stadiums: WorldCup2026Stadium[];
  teams: WorldCup2026Team[];
}): Match {
  const stadium = getStadiumById(stadiums, game?.stadium_id);
  const homeTeam = getTeamData(teams, game, 'home');
  const awayTeam = getTeamData(teams, game, 'away');
  const status = mapWorldCupStatusToMatchStatus(game);
  const actualHomeScore = getScoreValue(game?.home_score);
  const actualAwayScore = getScoreValue(game?.away_score);

  return {
    id: String(game?.id ?? ''),
    tournamentId: 'world-cup-2026',
    homeTeam: getTeamName(game, 'home'),
    awayTeam: getTeamName(game, 'away'),
    homeTeamFlag: homeTeam?.flag,
    awayTeamFlag: awayTeam?.flag,
    homeTeamCode: homeTeam?.fifa_code,
    awayTeamCode: awayTeam?.fifa_code,
    date: formatWorldCupDate(game?.local_date),
    kickoffTime: formatWorldCupTime(game?.local_date),
    tournament: 'Mundial 2026',
    group: getStageName(game),
    stadium: stadium?.fifa_name ?? stadium?.name_en ?? 'Estadio no disponible',
    city: stadium?.city_en ?? 'Ciudad no disponible',
    status,
    actualHomeScore: status === 'Finalizado' ? actualHomeScore : undefined,
    actualAwayScore: status === 'Finalizado' ? actualAwayScore : undefined,
  };
}

async function fetchWorldCupApi(path: string) {
  const url = buildWorldCupApiUrl(path);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `WorldCup2026 API respondió con error ${response.status}.`
    );
  }

  return data;
}

export async function getWorldCup2026Games() {
  const data = await fetchWorldCupApi('/get/games');

  if (Array.isArray(data?.games)) {
    return data.games;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}

export async function getWorldCup2026Stadiums(): Promise<WorldCup2026Stadium[]> {
  const data = await fetchWorldCupApi('/get/stadiums');

  if (Array.isArray(data?.stadiums)) {
    return data.stadiums;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}

export async function getWorldCup2026Teams(): Promise<WorldCup2026Team[]> {
  const data = await fetchWorldCupApi('/get/teams');

  if (Array.isArray(data?.teams)) {
    return data.teams;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}

export async function getWorldCup2026MatchSummaries() {
  const games = await getWorldCup2026Games();

  return games.map(mapWorldCupGameToSummary);
}

export async function getFootballDataTodayMatches() {
  return getWorldCup2026MatchSummaries();
}

export async function getFootballDataTodayAppMatches(): Promise<Match[]> {
  const [games, stadiums, teams] = await Promise.all([
    getWorldCup2026Games(),
    getWorldCup2026Stadiums(),
    getWorldCup2026Teams(),
  ]);

  return games.map((game: any) =>
    mapWorldCupGameToAppMatch({
      game,
      stadiums,
      teams,
    })
  );
}

export async function testFootballApiConnection(): Promise<FootballApiResult> {
  if (!isFootballApiConfigured()) {
    return {
      ok: false,
      message:
        'La API de fútbol todavía no está configurada. Falta agregar la URL base.',
    };
  }

  try {
    const games = await getWorldCup2026Games();

    return {
      ok: true,
      matchesCount: games.length,
      message: `Conexión real exitosa con ${footballApiConfig.provider}. Partidos encontrados: ${games.length}.`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'No se pudo conectar con WorldCup2026 API.';

    return {
      ok: false,
      message: errorMessage,
    };
  }
}