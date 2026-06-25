import { mockGroup } from '@/data/mockGroup';
import type { CreateGroupInput, Group } from '@/types/group';

function generateGroupCode(groupName: string) {
  const cleanName = groupName
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  const baseCode = cleanName.slice(0, 5) || 'GRUPO';

  return `${baseCode}-2026`;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function getCurrentGroup(): Promise<Group> {
  await wait(500);

  return mockGroup;
}

export async function findGroupByInviteCode(inviteCode: string) {
  await wait(900);

  const cleanInviteCode = inviteCode.trim().toUpperCase();

  if (cleanInviteCode === mockGroup.inviteCode) {
    return mockGroup;
  }

  return null;
}

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  await wait(900);

  const cleanName = input.name.trim();

  return {
    id: cleanName.toLowerCase().replace(/\s+/g, '-'),
    name: cleanName,
    inviteCode: generateGroupCode(cleanName),
    description: input.description.trim(),
    activeTournaments: 1,
  };
}