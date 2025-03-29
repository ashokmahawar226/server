import { Express } from 'express-serve-static-core';
import { User } from '../models/user';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}
