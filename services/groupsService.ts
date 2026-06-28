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

export async function getCurrentGroup(): Promise<Group | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('group_members')
    .select(
      `
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

  if (!group) {
    return null;
  }

  return mapSupabaseGroupToAppGroup(group);
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
      (profileItem) => profileItem.id === member.user_id
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

  const appGroup = mapSupabaseGroupToAppGroup(group);
  const members = await getGroupMembers(appGroup.id);

  return {
    group: appGroup,
    role,
    members,
  };
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

  return mapSupabaseGroupToAppGroup(group as SupabaseGroup);
}