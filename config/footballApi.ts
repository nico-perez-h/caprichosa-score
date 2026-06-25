export const footballApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_FOOTBALL_BASE_URL ?? '',
  apiKey: process.env.EXPO_PUBLIC_API_FOOTBALL_KEY ?? '',
  provider: 'SportMonks',
};

export function isFootballApiConfigured() {
  return Boolean(footballApiConfig.baseUrl && footballApiConfig.apiKey);
}