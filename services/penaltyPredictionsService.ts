import { supabase } from "@/lib/supabase";

export type UserPenaltyPrediction = {
  id: string;
  user_id: string;
  group_id: string;
  match_id: string;
  home_penalty_score: number;
  away_penalty_score: number;
  created_at: string;
  updated_at: string;
};

export async function getUserPenaltyPredictions({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const { data, error } = await supabase
    .from("penalty_predictions")
    .select("*")
    .eq("user_id", userId)
    .eq("group_id", groupId);

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPenaltyPrediction[];
}

export async function getUserPenaltyPredictionByMatchId({
  userId,
  groupId,
  matchId,
}: {
  userId: string;
  groupId: string;
  matchId: string;
}) {
  const { data, error } = await supabase
    .from("penalty_predictions")
    .select("*")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .eq("match_id", matchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPenaltyPrediction | null;
}

export async function upsertUserPenaltyPrediction({
  userId,
  groupId,
  matchId,
  homePenaltyScore,
  awayPenaltyScore,
}: {
  userId: string;
  groupId: string;
  matchId: string;
  homePenaltyScore: number;
  awayPenaltyScore: number;
}) {
  const { data, error } = await supabase
    .from("penalty_predictions")
    .upsert(
      {
        user_id: userId,
        group_id: groupId,
        match_id: matchId,
        home_penalty_score: homePenaltyScore,
        away_penalty_score: awayPenaltyScore,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,group_id,match_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPenaltyPrediction;
}

export async function deleteUserPenaltyPrediction({
  userId,
  groupId,
  matchId,
}: {
  userId: string;
  groupId: string;
  matchId: string;
}) {
  const { error } = await supabase
    .from("penalty_predictions")
    .delete()
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .eq("match_id", matchId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getPenaltyPredictionsByUserIds({
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
    .from("penalty_predictions")
    .select("*")
    .in("user_id", userIds)
    .eq("group_id", groupId);

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPenaltyPrediction[];
}