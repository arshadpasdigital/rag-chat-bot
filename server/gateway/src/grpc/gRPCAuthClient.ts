import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { env } from '../utils/env';
import type { NextFunction,Request,Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export const PROTO_PATH = path.join('/app','proto','auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const grpcAuthClient = new proto.AuthService(
    `auth-service:${env.AUTH_SERVICE_GRPC_PORT}`,
    grpc.credentials.createInsecure(),
)

export function registerUser(req:Request,res:Response,next:NextFunction) {
    try {
        grpcAuthClient.RegisterUser({
            email:req.body.email,
            password:req.body.password
        },(err:any,response:any)=>{
            if(err){
                return res.status(500).json(ApiResponse.error(err,500,err.message))
            }
            return res.json(response)
        })
    } catch (error) {
        next(error)
    }
}

// export function allTask() {
//     return new Promise((resolve,reject)=>{
//         client.GetTasks({},(err:any,response:any)=>{
//             if(err){
//                 console.error(err)
//                 return;
//             }
//             resolve(response)
//         })
//     })
// }
