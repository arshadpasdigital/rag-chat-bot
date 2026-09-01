
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import crypto from 'crypto'
import path from 'path'
import { env } from '../utils/env';
import { graph } from '../graph';

export const PROTO_DIR = path.join('/app','proto');

const packageDefinition = protoLoader.loadSync([
    path.join(PROTO_DIR, 'task.proto'),
    path.join(PROTO_DIR, 'chat.proto')
], {
    keepCase: true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const tasksProto = proto.tasks;
const chatProto = proto.chat;

const randomTask = ()=>{
    const titles = ["learning docker","complete", 'adadfasdf','adsfasdfasdf'];

    return {
        id:crypto.randomUUID(),
        title:titles[Math.floor(Math.random()*titles.length)],
        completed: Math.random() > 0.5
    }
}

async function Chat(call:grpc.ServerWritableStream<any,any>) {
    const {userId,message} = call.request;

    const graphStream = await graph.stream({
        messages:[{role:"user",content:message}],
        userId
    },{
        streamMode:"custom",
        subgraphs:true,
        recursionLimit:400,
        configurable:{
            userId
        }
    })

    let isThinking = false;
    for await (const [_,chunk] of graphStream) {
        const content = (chunk as any)?.content;
        if(!content) continue;

        const parts = content.split(/(<think>|<\/think>)/);
        for (const part of parts) {
            if(part ==="<think>"){
                isThinking=true;
                continue;
            }

            if(part ==="</think>"){
                isThinking=false;
                continue;
            }

            if(!part) continue;

            call.write({
                type: isThinking ? 'THINKING':'CONTENT',
                content:part
            })
        }
    }
    call.write({
        type:'DONE',
        content:''
    })

    call.end();
}

async function GetTasks(call:any,callback:any) {
    try {
        const generateTask = Array.from({length:3},randomTask);
        callback(null, {
            tasks:generateTask
        })
    } catch (error) {
        callback(null,error)
    }
}

export const startTaskServers = ()=>{
    const server = new grpc.Server();

    server.addService(tasksProto.TaskService.service,{
        GetTasks
    })

    server.addService(chatProto.TaskService.service,{
        Chat
    })

    server.bindAsync(`0.0.0.0:${env.GRPC_PORT}`,grpc.ServerCredentials.createInsecure(),
    (error,port)=>{
        if(error){
            console.error(`Server failed to bind: ${error.message}`);
            return;
        }
        console.log(`Task Service running on port : ${port}`)
    }
    )
}

