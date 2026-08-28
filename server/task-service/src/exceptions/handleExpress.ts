import type { NextFunction, Request,Response } from "express";
import { ApiResponse } from "../utils/apiResponse";


export const handleExpressError =(err:Error, req:Request,res:Response,next:NextFunction)=>{
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const message = err instanceof Error ? err.message : "internal server error";

    res.status(statusCode).json(ApiResponse.error(err,statusCode,message))
}