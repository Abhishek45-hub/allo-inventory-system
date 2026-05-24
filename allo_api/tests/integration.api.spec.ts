import request from 'supertest';
import { app } from '@/app';

describe('api integration', () => {
  it('returns health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
