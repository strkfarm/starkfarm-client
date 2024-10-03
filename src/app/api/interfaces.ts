import { User } from '@prisma/client';

export interface UserTncInfo {
  success: boolean;
  user: User | null;
}
