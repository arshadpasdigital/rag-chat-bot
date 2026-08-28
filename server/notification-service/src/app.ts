import 'dotenv/config';
import express from 'express'
import { expressServer } from './server';

const app = express();
const port = Number(process.env.PORT ?? 3000)

expressServer(app,port)

interface Empty{}

interface Task{
    id:string,
    title:string,
    completed:boolean
}

interface TaskList{
    tasks:Task[]
}

class TaskService{
    GetTasks(props:Empty):TaskList { 
        return {tasks:[{id:"",title:"",completed:false}]}
    }
}