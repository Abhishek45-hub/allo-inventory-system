import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { env } from '@/config/env';

export interface JwtAuthPayload {
  sub: string;
  role: UserRole;
  tokenVersion: number;
}

export class JwtProvider {
  signAccess(payload: JwtAuthPayload): string {
    const expiresIn = env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'];
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn });
  }

  signRefresh(payload: JwtAuthPayload): string {
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'];
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn });
  }

  verifyAccess(token: string): JwtAuthPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAuthPayload;
  }

  verifyRefresh(token: string): JwtAuthPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtAuthPayload;
  }
}
