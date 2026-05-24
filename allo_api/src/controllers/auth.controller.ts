import type { Request, Response } from 'express';
import { HttpStatus } from '@/constants/http-status';
import { AuthService } from '@/services/auth.service';
import { ok } from '@/utils/response';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const payload = await authService.login(email, password);
    res.status(HttpStatus.OK).json(ok('Login successful', payload));
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const payload = await authService.refresh(req.body.refreshToken);
    res.status(HttpStatus.OK).json(ok('Token refreshed', payload));
  }
}
