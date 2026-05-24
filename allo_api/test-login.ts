import { AuthService } from './src/services/auth.service';

async function test() {
  const auth = new AuthService();
  try {
    await auth.login('admin@allo.health', 'password');
    console.log('Login successful');
  } catch (err) {
    console.error('Error occurred:', err);
  }
}

test();
