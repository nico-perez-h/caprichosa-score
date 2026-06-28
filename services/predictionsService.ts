import { supabase } from '@/lib/supabase';

export type UserPrediction = {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  created_at: string;
  updated_at: string;
};

export async function getUserPredictions(userId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPrediction[];
}

export async function upsertUserPrediction({
  userId,
  matchId,
  homeScore,
  awayScore,
}: {
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
}) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id: userId,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,match_id',
      },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPrediction;
}

export async function deleteUserPrediction({
  userId,
  matchId,
}: {
  userId: string;
  matchId: string;
}) {
  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('user_id', userId)
    .eq('match_id', matchId);

  if (error) {
    throw new Error(error.message);
  }
}