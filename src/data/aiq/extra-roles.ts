import type { RoleData } from './types';
import { emRole } from './em';
import { fdeRole } from './fde';
import { mleRole } from './mle';
import { nlpRole } from './nlp';
import { searchRole } from './search';

export const extraRoles: RoleData[] = [
  mleRole,
  nlpRole,
  searchRole,
  fdeRole,
  emRole,
];
