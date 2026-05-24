import bcrypt from 'bcryptjs';

export class PasswordProvider {
  hash(value: string): Promise<string> {
    return bcrypt.hash(value, 12);
  }

  compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
