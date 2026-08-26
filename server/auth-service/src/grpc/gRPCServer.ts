
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import crypto from 'crypto'
import path from 'path'

const PROT_PATH = path.join(process.cwd(),'proto','task.proto');

const packageDefinition = protoLoader.loadSync(PROT_PATH, {
    keepCase: true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true
});