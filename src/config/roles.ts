import { Role } from '@prisma/client';

const allRoles = {
  [Role.STUDENT]: [],
  [Role.ADMIN]: ['ADMIN']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
