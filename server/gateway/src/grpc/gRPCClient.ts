import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { env } from '../utils/env';

export const PROTO_PATH = path.join('/app','proto','task.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const client = new proto.TaskService(
    `task-service:${env.PORT}`,
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