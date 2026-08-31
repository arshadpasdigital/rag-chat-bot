
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import crypto from 'crypto'
import path from 'path'
import { env } from '../utils/env';
import type { UserService } from '../service/user.service';

export const PROTO_PATH = path.join('/app', 'proto', 'auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const auths = proto.auth;


export class AuthgRPCServices {
    constructor(private readonly authService: UserService) { }

    async RegisterUsergRPC(call: any, callback: any) {
        try {
            const response = await this.authService.register({
                email:call.request.email,
                password:call.request.password
            });
            callback(null, response);
    } catch (error:unknown) {
        const errMessage = error instanceof Error ? error.message : "User Registeration Failed."
        callback({
            message: errMessage,
            code:grpc.status.INVALID_ARGUMENT
        },null)
        }
    }

    async verifyUserEmailgRPC(call: any, callback: any) {
        try {
            const response = await this.authService.verifyEmail({
                email:call.request.email,
                optCode:call.request.otp_code
            });
            callback(null, response);
    } catch (error:unknown) {
        const errMessage = error instanceof Error ? error.message : "User Email verification Failed."
        callback({
            message: errMessage,
            code:grpc.status.INVALID_ARGUMENT
        },null)
        }
    }

    async loginUsergRPC(call:any, callback:any){
        try {
            const response = await this.authService.login({
                email:call.request.email,
                password:call.request.password
            });
            callback(null, response);
    } catch (error:unknown) {
        const errMessage = error instanceof Error ? error.message : "User login Failed."
        callback({
            message: errMessage,
            code:grpc.status.INVALID_ARGUMENT
        },null)
        }
    }
}


export const startAuthServers = (authGrpcServices: AuthgRPCServices)=>{
    const server = new grpc.Server();

    server.addService(auths.AuthService.service, {
		RegisterUser: authGrpcServices.RegisterUsergRPC,
		VerifyUserEmail: authGrpcServices.verifyUserEmailgRPC,
        loginUser:authGrpcServices.loginUsergRPC
	});

    server.bindAsync(`0.0.0.0:${env.GRPC_PORT}`,grpc.ServerCredentials.createInsecure(),
    (error,port)=>{
        if(error){
            console.error(`Server failed to bind: ${error.message}`);
            return;
        }
        console.log(`Auth Service running on port : ${port}`)
    }
    )
}


// const randomTask = ()=>{
//     const titles = ["learning docker","complete", 'adadfasdf','adsfasdfasdf'];

//     return {
//         id:crypto.randomUUID(),
//         title:titles[Math.floor(Math.random()*titles.length)],
//         completed: Math.random() > 0.5
//     }
// }

// async function GetTasks(call:any,callback:any) {
//     try {
//         const generateTask = Array.from({length:3},randomTask);
//         callback(null, {
//             tasks:generateTask
//         })
//     } catch (error) {
//         callback(null,error)
//     }
// }

// export const startTaskServers = ()=>{
//     const server = new grpc.Server();
//     server.addService(tasks.TaskService.service,{
//         GetTasks
//     })

//     server.bindAsync(`0.0.0.0:${env.PORT}`,grpc.ServerCredentials.createInsecure(),
//     (error,port)=>{
//         if(error){
//             console.error(`Server failed to bind: ${error.message}`);
//             return;
//         }
//         console.log(`Task Service running on port : ${port}`)
//     }
//     )
// }
