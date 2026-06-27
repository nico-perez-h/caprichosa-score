import { supabase } from '@/lib/supabase';

export type UserProfile = {
  id: string;
  player_name: string;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data as UserProfile;
}

export async function createProfile({
  userId,
  email,
  playerName,
}: {
  userId: string;
  email: string | null;
  playerName: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      player_name: playerName,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
}

export async function getOrCreateProfile({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  const existingProfile = await getProfile(userId);

  if (existingProfile) {
    return existingProfile;
  }

  return createProfile({
    userId,
    email,
    playerName: 'Jugador local',
  });
}

export async function updateProfileName({
  userId,
  playerName,
}: {
  userId: string;
  playerName: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      player_name: playerName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
}