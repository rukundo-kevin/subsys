import { Role } from '@prisma/client';

const allRoles = {
  [Role.STUDENT]: [],
  [Role.LECTURER]: ['getStudents'],
  [Role.ADMIN]: ['createStudents', 'getStudents']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
