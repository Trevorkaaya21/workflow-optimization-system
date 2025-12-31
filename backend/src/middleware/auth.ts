import { Request, Response, NextFunction } from 'express';
import { Role } from '../config.js';

export interface AuthedRequest extends Request {
  user?: { id: string; role: Role };
}

export const mockAuth = (req: AuthedRequest, _res: Response, next: NextFunction) => {
  const id = req.header('x-user-id') || 'demo-user';
  const role = (req.header('x-user-role') as Role) || 'manager';
  req.user = { id, role };
  next();
};

export const requireRole = (roles: Role[]) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
