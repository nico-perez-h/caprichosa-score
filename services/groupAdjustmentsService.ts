import { supabase } from '@/lib/supabase';

export type GroupPointAdjustment = {
  id: string;
  group_id: string;
  admin_user_id: string;
  target_user_id: string;
  points: number;
  reason: string;
  created_at: string;
};

export type GroupAnnouncement = {
  id: string;
  group_id: string;
  created_by: string | null;
  type: 'info' | 'points_adjustment';
  title: string;
  message: string;
  created_at: string;
};

export async function getGroupPointAdjustments(groupId: string) {
  const { data, error } = await supabase
    .from('group_point_adjustments')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as GroupPointAdjustment[];
}

export async function getGroupAnnouncements(groupId: string) {
  const { data, error } = await supabase
    .from('group_announcements')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return data as GroupAnnouncement[];
}

export async function createGroupAnnouncement({
  groupId,
  createdBy,
  title,
  message,
  type = 'info',
}: {
  groupId: string;
  createdBy: string;
  title: string;
  message: string;
  type?: 'info' | 'points_adjustment';
}) {
  const { data, error } = await supabase
    .from('group_announcements')
    .insert({
      group_id: groupId,
      created_by: createdBy,
      type,
      title,
      message,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GroupAnnouncement;
}

export async function createPointAdjustment({
  groupId,
  adminUserId,
  targetUserId,
  targetPlayerName,
  points,
  reason,
}: {
  groupId: string;
  adminUserId: string;
  targetUserId: string;
  targetPlayerName: string;
  points: number;
  reason: string;
}) {
  if (points === 0) {
    throw new Error('El ajuste debe ser mayor o menor a 0.');
  }

  const cleanReason = reason.trim();

  const { data: adjustment, error: adjustmentError } = await supabase
    .from('group_point_adjustments')
    .insert({
      group_id: groupId,
      admin_user_id: adminUserId,
      target_user_id: targetUserId,
      points,
      reason: cleanReason,
    })
    .select()
    .single();

  if (adjustmentError) {
    throw new Error(adjustmentError.message);
  }

  const actionText = points > 0 ? 'sumó' : 'quitó';
  const absolutePoints = Math.abs(points);
  const pointsText = absolutePoints === 1 ? 'punto' : 'puntos';

  await createGroupAnnouncement({
    groupId,
    createdBy: adminUserId,
    type: 'points_adjustment',
    title: 'Ajuste de puntos',
    message: `El administrador ${actionText} ${absolutePoints} ${pointsText} a ${targetPlayerName}.`,
  });

  return adjustment as GroupPointAdjustment;
}
