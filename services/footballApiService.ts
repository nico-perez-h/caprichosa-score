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

  return {
    ok: true,
    message: `Configuración lista para conectar con ${footballApiConfig.provider}.`,
  };
}