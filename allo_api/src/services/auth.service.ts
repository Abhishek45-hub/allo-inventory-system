import { createHash } from 'node:crypto';
import { HttpStatus } from '@/constants/http-status';
import { UserRepository } from '@/repositories/user.repository';
import { JwtProvider } from '@/providers/jwt.provider';
import { PasswordProvider } from '@/providers/password.provider';
import { AppError } from '@/utils/app-error';

const userRepository = new UserRepository();
const jwtProvider = new JwtProvider();
const passwordProvider = new PasswordProvider();

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, 'Invalid credentials');
    }

    const valid = await passwordProvider.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(HttpStatus.UNAUTHORIZED, 'Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role, tokenVersion: user.tokenVersion };
    const accessToken = jwtProvider.signAccess(payload);
    const refreshToken = jwtProvider.signRefresh(payload);
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');
    await userRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }

  async refresh(refreshToken: string) {
    const payload = jwtProvider.verifyRefresh(refreshToken);
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    const hash = createHash('sha256').update(refreshToken).digest('hex');
    if (!user.refreshTokenHash || user.refreshTokenHash !== hash) {
      throw new AppError(HttpStatus.UNAUTHORIZED, 'Refresh token revoked');
    }

    const nextPayload = { sub: user.id, role: user.role, tokenVersion: user.tokenVersion };
    return {
      accessToken: jwtProvider.signAccess(nextPayload),
      refreshToken: jwtProvider.signRefresh(nextPayload),
    };
  }
}
