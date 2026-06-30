import { supabase } from '@/lib/supabase';
import type { CreateGroupInput, Group } from '@/types/group';

type SupabaseGroup = {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type SupabaseGroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
};

type SupabaseProfile = {
  id: string;
  player_name: string;
  email: string | null;
};

export type GroupMemberWithProfile = {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  playerName: string;
  email: string | null;
};

export type MyGroupItem = {
  group: Group;
  role: 'admin' | 'member';
  isActive: boolean;
};

export type CurrentGroupData = {
  group: Group;
  role: 'admin' | 'member';
  members: GroupMemberWithProfile[];
};

function mapSupabaseGroupToAppGroup(group: SupabaseGroup): Group {
  return {
    id: group.id,
    name: group.name,
    inviteCode: group.join_code,
    description: group.description ?? '',
    activeTournaments: 1,
  };
}

function generateJoinCode() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `CAP-${randomNumber}`;
}

async function createUniqueJoinCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const joinCode = generateJoinCode();

    const { data, error } = await supabase
      .from('groups')
      .select('id')
      .eq('join_code', joinCode)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return joinCode;
    }
  }

  throw new Error('No se pudo generar un código único para el grupo.');
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Debes iniciar sesión para usar grupos.');
  }

  return data.user.id;
}

async function getActiveGroupId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('active_group_id')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data?.active_group_id as string | null;
}

async function setActiveGroupId({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string | null;
}) {
  const { error } = await supabase
    .from('profiles')
    .update({
      active_group_id: groupId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function getLatestMembership(userId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(
      `
      role,
      groups (
        id,
        name,
        description,
        join_code,
        created_by,
        created_at,
        updated_at
      )
    `,
    )
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const group = (data as any)?.groups as SupabaseGroup | null;
  const role = (data as any)?.role as 'admin' | 'member' | undefined;

  if (!group || !role) {
    return null;
  }

  return {
    group,
    role,
  };
}

async function getMembershipByGroupId({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const { data, error } = await supabase
    .from('group_members')
    .select(
      `
      role,
      groups (
        id,
        name,
        description,
        join_code,
        created_by,
        created_at,
        updated_at
      )
    `,
    )
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const group = (data as any)?.groups as SupabaseGroup | null;
  const role = (data as any)?.role as 'admin' | 'member' | undefined;

  if (!group || !role) {
    return null;
  }

  return {
    group,
    role,
  };
}

async function getGroupMemberByUserId({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) {
  const { data, error } = await supabase
    .from('group_members')
    .select('id, group_id, user_id, role, joined_at')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as SupabaseGroupMember | null;
}

export async function getCurrentGroup(): Promise<Group | null> {
  const userId = await getCurrentUserId();
  const activeGroupId = await getActiveGroupId(userId);

  if (activeGroupId) {
    const activeMembership = await getMembershipByGroupId({
      userId,
      groupId: activeGroupId,
    });

    if (activeMembership) {
      return mapSupabaseGroupToAppGroup(activeMembership.group);
    }
  }

  const latestMembership = await getLatestMembership(userId);

  if (!latestMembership) {
    return null;
  }

  await setActiveGroupId({
    userId,
    groupId: latestMembership.group.id,
  });

  return mapSupabaseGroupToAppGroup(latestMembership.group);
}

export async function getGroupMembers(groupId: string) {
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('id, group_id, user_id, role, joined_at')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (membersError) {
    throw new Error(membersError.message);
  }

  const typedMembers = (members ?? []) as SupabaseGroupMember[];
  const userIds = typedMembers.map((member) => member.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, player_name, email')
    .in('id', userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const typedProfiles = (profiles ?? []) as SupabaseProfile[];

  return typedMembers.map<GroupMemberWithProfile>((member) => {
    const profile = typedProfiles.find(
      (profileItem) => profileItem.id === member.user_id,
    );

    return {
      id: member.id,
      groupId: member.group_id,
      userId: member.user_id,
      role: member.role,
      joinedAt: member.joined_at,
      playerName: profile?.player_name ?? 'Jugador',
      email: profile?.email ?? null,
    };
  });
}

export async function getCurrentGroupData(): Promise<CurrentGroupData | null> {
  const userId = await getCurrentUserId();
  const activeGroupId = await getActiveGroupId(userId);

  let membership = null;

  if (activeGroupId) {
    membership = await getMembershipByGroupId({
      userId,
      groupId: activeGroupId,
    });
  }

  if (!membership) {
    membership = await getLatestMembership(userId);
  }

  if (!membership) {
    return null;
  }

  await setActiveGroupId({
    userId,
    groupId: membership.group.id,
  });

  const appGroup = mapSupabaseGroupToAppGroup(membership.group);
  const members = await getGroupMembers(appGroup.id);

  return {
    group: appGroup,
    role: membership.role,
    members,
  };
}

export async function getMyGroups(): Promise<MyGroupItem[]> {
  const userId = await getCurrentUserId();
  const activeGroupId = await getActiveGroupId(userId);

  const { data, error } = await supabase
    .from('group_members')
    .select(
      `
      role,
      groups (
        id,
        name,
        description,
        join_code,
        created_by,
        created_at,
        updated_at
      )
    `,
    )
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((membership: any) => {
      const group = membership.groups as SupabaseGroup | null;

      if (!group) {
        return null;
      }

      return {
        group: mapSupabaseGroupToAppGroup(group),
        role: membership.role as 'admin' | 'member',
        isActive: group.id === activeGroupId,
      };
    })
    .filter(Boolean) as MyGroupItem[];
}

export async function setActiveGroup(groupId: string) {
  const userId = await getCurrentUserId();

  const membership = await getMembershipByGroupId({
    userId,
    groupId,
  });

  if (!membership) {
    throw new Error('No perteneces a este grupo.');
  }

  await setActiveGroupId({
    userId,
    groupId,
  });

  return mapSupabaseGroupToAppGroup(membership.group);
}

export async function findGroupByInviteCode(inviteCode: string) {
  const userId = await getCurrentUserId();
  const cleanInviteCode = inviteCode.trim().toUpperCase();

  if (!cleanInviteCode) {
    throw new Error('Escribe el código del grupo.');
  }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('join_code', cleanInviteCode)
    .single();

  if (groupError || !group) {
    return null;
  }

  const { error: memberError } = await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: userId,
    role: 'member',
  });

  if (memberError) {
    if (memberError.code === '23505') {
      throw new Error('Ya eres miembro de este grupo.');
    }

    throw new Error(memberError.message);
  }

  await setActiveGroupId({
    userId,
    groupId: group.id,
  });

  return mapSupabaseGroupToAppGroup(group as SupabaseGroup);
}

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  const userId = await getCurrentUserId();
  const cleanName = input.name.trim();
  const cleanDescription = input.description.trim();

  if (!cleanName) {
    throw new Error('Escribe un nombre para crear tu grupo.');
  }

  const joinCode = await createUniqueJoinCode();

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: cleanName,
      description: cleanDescription,
      join_code: joinCode,
      created_by: userId,
    })
    .select()
    .single();

  if (groupError) {
    throw new Error(groupError.message);
  }

  const { error: memberError } = await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: userId,
    role: 'admin',
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  await setActiveGroupId({
    userId,
    groupId: group.id,
  });

  return mapSupabaseGroupToAppGroup(group as SupabaseGroup);
}

export async function leaveGroup(groupId: string) {
  const userId = await getCurrentUserId();

  const { error: memberError } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (memberError) {
    throw new Error(memberError.message);
  }

  const activeGroupId = await getActiveGroupId(userId);

  if (activeGroupId === groupId) {
    const latestMembership = await getLatestMembership(userId);

    await setActiveGroupId({
      userId,
      groupId: latestMembership?.group.id ?? null,
    });
  }
}

export async function deleteGroup(groupId: string) {
  const userId = await getCurrentUserId();

  const membership = await getMembershipByGroupId({
    userId,
    groupId,
  });

  if (!membership || membership.role !== 'admin') {
    throw new Error('Solo el administrador puede eliminar este grupo.');
  }

  const { error } = await supabase.from('groups').delete().eq('id', groupId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeGroupMemberFromGroup({
  groupId,
  targetUserId,
}: {
  groupId: string;
  targetUserId: string;
}) {
  const adminUserId = await getCurrentUserId();

  if (adminUserId === targetUserId) {
    throw new Error(
      'No puedes quitarte a ti mismo desde aquí. Usa la opción de eliminar grupo o salir del grupo.',
    );
  }

  const adminMembership = await getMembershipByGroupId({
    userId: adminUserId,
    groupId,
  });

  if (!adminMembership || adminMembership.role !== 'admin') {
    throw new Error('Solo el administrador puede quitar integrantes.');
  }

  const targetMembership = await getGroupMemberByUserId({
    groupId,
    userId: targetUserId,
  });

  if (!targetMembership) {
    throw new Error('Este usuario ya no pertenece al grupo.');
  }

  if (targetMembership.role === 'admin') {
    throw new Error('No puedes quitar a otro administrador del grupo.');
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', targetUserId);

  if (error) {
    throw new Error(error.message);
  }
}