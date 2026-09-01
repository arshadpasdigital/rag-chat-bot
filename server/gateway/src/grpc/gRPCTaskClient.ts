import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { env } from '../utils/env';
import type { NextFunction,Request,Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export const PROTO_DIR = path.join('/app','proto');

const packageDefinition = protoLoader.loadSync([
    path.join(PROTO_DIR,'tasks.proto'),
    path.join(PROTO_DIR,'chat.proto')
], {
    keepCase: true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;

const taskProto = grpcObject.tasks;
const chatProto = grpcObject.chat;

const grpcTaskClient = new taskProto.TaskService(
    `task-service:${env.TASK_SERVICE_GRPC_PORT}`,
    grpc.credentials.createInsecure(),
)

const grpcChatClient = new chatProto.TaskService(
    `task-service:${env.TASK_SERVICE_GRPC_PORT}`,
    grpc.credentials.createInsecure(),
)

export function getAllTask(req:Request,res:Response,next:NextFunction) {
    try {
        grpcTaskClient.GetTasks({},(err:any,response:any)=>{
            if(err){
                return res.status(500).json(ApiResponse.error(err,500,err.message))
            }
            return res.json(response)
        })
    } catch (error) {
        next(error)
    }
}

export function postChat(req:Request,res:Response,next:NextFunction){
    try {
        const {message,threadId, userId} = req.body;

        res.setHeader('Content-Type','text/event-stream')
        res.setHeader('Cache-Control','no-cache')
        res.setHeader('Connection','keep-alive')
    } catch (error) {
        next(error)
    }
}
