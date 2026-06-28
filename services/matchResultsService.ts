import { supabase } from "@/lib/supabase";

export type ManualMatchResult = {
  id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  status: "Por jugar" | "En vivo" | "Finalizado";
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function getManualMatchResults() {
  const { data, error } = await supabase
    .from("match_results")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as ManualMatchResult[];
}

export async function getManualMatchResultByMatchId(matchId: string) {
  const { data, error } = await supabase
    .from("match_results")
    .select("*")
    .eq("match_id", matchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ManualMatchResult | null;
}

export async function upsertManualMatchResult({
  matchId,
  homeScore,
  awayScore,
  status,
  updatedBy,
}: {
  matchId: string;
  homeScore: number;
  awayScore: number;
  status: "Por jugar" | "En vivo" | "Finalizado";
  updatedBy: string;
}) {
  const { data, error } = await supabase
    .from("match_results")
    .upsert(
      {
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        status,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "match_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ManualMatchResult;
}

export async function deleteManualMatchResult(matchId: string) {
  const { error } = await supabase
    .from("match_results")
    .delete()
    .eq("match_id", matchId);

  if (error) {
    throw new Error(error.message);
  }
}