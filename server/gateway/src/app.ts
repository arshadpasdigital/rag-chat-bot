import express from 'express'
import { expressServer } from './server';

const app = express();
const router = express.Router();

expressServer(app,router)

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