import { Role } from '@prisma/client';

const allRoles = {
  [Role.STUDENT]: ['getStudents'],
  [Role.LECTURER]: ['getStudents', 'manageAssignments'],
  [Role.ADMIN]: [
    'createStudents',
    'deleteStudents',
    'updateStudents',
    'getStudents',
    'manageLecturers'
  ]
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
