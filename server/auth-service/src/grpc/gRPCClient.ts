import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { error } from 'console';
import crypto from 'crypto'
import path from 'path'
import { PROTO_PATH } from './gRPCServer';
import { env } from '../utils/env';




const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new proto.TaskService(
    `localhost:${env.PORT}`,
    grpc.credentials.createInsecure(),
)

export function allTask() {
    return new Promise((resolve,reject)=>{
        client.GetTasks({},(err:any,response:any)=>{
            if(err){
                console.error(err)
                return;
            }
            resolve(response)
        })
    })
}