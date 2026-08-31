import jwt from "jsonwebtoken";
import type { Request,Response,NextFunction } from "express";
import { env } from "../utils/env";

export interface AuthenticatedRequest extends Request {
	userId: string;
	tokenVersion: number;
}

export const verifiedExpressToken = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;
    if (!token) {
        next(new Error('Authentication is required'));
        return;
    }
    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        if (typeof payload === 'string' || typeof payload.sub !== 'string') {
            throw new Error('Invalid or expired token');
        }
        
        const authenticatedRequest = req as AuthenticatedRequest;
        authenticatedRequest.userId = payload.sub;
        authenticatedRequest.tokenVersion = typeof payload.version === 'number' ? payload.version : 0;
        next();
    } catch (error) {
        res.status(401).json({message:"Unauthorized"})
    }
}
