import {
  footballApiConfig,
  isFootballApiConfigured,
} from '@/config/footballApi';

export async function testFootballApiConnection() {
  if (!isFootballApiConfigured()) {
    return {
      ok: false,
      message:
        'La API de fútbol todavía no está configurada. Falta agregar la URL base y la API key.',
    };
  }

  try {
    const url = new URL(`${footballApiConfig.baseUrl}/livescores/inplay`);

    url.searchParams.append('api_token', footballApiConfig.apiKey);
    url.searchParams.append(
      'include',
      'participants;scores;periods;events;league.country;round'
    );

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        message:
          data?.message ??
          `SportMonks respondió con error ${response.status}. Revisa tu token o tu plan.`,
      };
    }

    const liveMatchesCount = Array.isArray(data?.data) ? data.data.length : 0;

    return {
      ok: true,
      message: `Conexión real exitosa con SportMonks. Partidos en vivo encontrados: ${liveMatchesCount}.`,
    };
  } catch {
    return {
      ok: false,
      message:
        'No se pudo conectar con SportMonks. Revisa tu internet, la URL base o tu token.',
    };
  }
}