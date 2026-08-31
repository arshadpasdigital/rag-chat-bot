import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "../utils/env";
import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../exceptions/appError";
import type { AuthenticatedRequest } from "../utils/authenticate";

const jwtPayload = (userId: Types.ObjectId) => {
    return {
        iss: "auth-service",
        sub: userId,
        aud: 'gateway',
        iat: Math.floor(Date.now() / 1000)
    }
}

export const signedAccessToken = (userId: Types.ObjectId) => {
    try {
        const payload = jwtPayload(userId);
        const privateKey = env.JWT_ACCESS_SECRET as string;
        return jwt.sign(payload, privateKey, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "failed to sign the access token"
        throw new Error(errorMessage)
    }
}

export const signedRefreshToken = (userId: Types.ObjectId) => {
    try {
        const payload = jwtPayload(userId);
        const privateKey = env.JWT_REFRESH_SECRET as string;
        return jwt.sign(payload, privateKey, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "failed to sign the refresh token"
        throw new Error(errorMessage)
    }
}


export const verifiedExpressToken = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;
    if (!token) {
        next(new AppError('Authentication is required', 401, 'UNAUTHENTICATED'));
        return;
    }
    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        if (typeof payload === 'string' || typeof payload.sub !== 'string') {
            throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
        }
        
        const authenticatedRequest = req as AuthenticatedRequest;
        authenticatedRequest.userId = payload.sub;
        authenticatedRequest.tokenVersion = typeof payload.version === 'number' ? payload.version : 0;
        next();
    } catch (error) {
        res.status(401).json(ApiResponse.error(error, 401, "Unauthorized"))
    }
}
