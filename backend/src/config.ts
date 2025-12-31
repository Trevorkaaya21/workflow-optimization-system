export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};

export type Role = 'manager' | 'ops' | 'finance' | 'director';
