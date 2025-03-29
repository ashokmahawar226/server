import { NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import jwt from 'jsonwebtoken';
import * as express from 'express';

export const validateToken = async (req: express.Request,
    res: express.Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')!;
    if (!token) {
      throw new Error();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!decoded) {
      throw new Error();
    }
    const username = decoded.username;
    res.locals.user = username;
    next();
  } catch (e) {
    res.status(401).send('invalid token!');
  }
};