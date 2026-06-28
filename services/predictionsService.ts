import { supabase } from '@/lib/supabase';

export type UserPrediction = {
  id: string;
  user_id: string;
  group_id: string | null;
  match_id: string;
  home_score: number;
  away_score: number;
  created_at: string;
  updated_at: string;
};

export async function getUserPredictions({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('group_id', groupId);

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPrediction[];
}

export async function upsertUserPrediction({
  userId,
  groupId,
  matchId,
  homeScore,
  awayScore,
}: {
  userId: string;
  groupId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
}) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id: userId,
        group_id: groupId,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,group_id,match_id',
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
  groupId,
  matchId,
}: {
  userId: string;
  groupId: string;
  matchId: string;
}) {
  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .eq('match_id', matchId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getPredictionsByUserIds({
  userIds,
  groupId,
}: {
  userIds: string[];
  groupId: string;
}) {
  if (userIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .in('user_id', userIds)
    .eq('group_id', groupId);

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPrediction[];
}