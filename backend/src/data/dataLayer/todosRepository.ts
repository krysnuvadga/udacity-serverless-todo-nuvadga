/// Imports
import { TodoItem } from "../models/todo";
import { CreateTodoRequest } from "../../requests/createTodoRequest";
import { UpdateTodoRequest } from "../../requests/updateTodoRequest";
import { XawsHelper} from "../../helpers/xawsHelper"
import { createLogger } from '../../utils/logger'

/// Variables
const logger = createLogger('todos')
const uuid = require('uuid/v4')
const xaws = new XawsHelper()

/**
 * Todos repository for Todo's CURD operations
 */
export class TodosRepository{
    constructor(
        private readonly docClient = xaws.getDocumentClient(),
        private readonly todosTable = process.env.TODO_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    )
        {}

    /**
     * Get authorized user todos list
     * @param userId Authorized user id
     */
    async getUserTodos(userId: string): Promise<TodoItem[]>{
        const param = {
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId':userId
            },
            Limit: 5
        }
        
        const dataResult = await this.docClient
                                        .query(param)
                                        .promise()
        return dataResult.Items as TodoItem[]
    }

    /**
     * Create new Todo Item
     * @param request Create todo data
     * @param userId Logged user id
     */
    async createTodo(request: CreateTodoRequest,userId: string): Promise<TodoItem>{
        const item:TodoItem = {
            userId: userId,
            todoId: uuid(),
            createdAt: new Date().toISOString(),
            name: request.name,
            dueDate: request.dueDate,
            done: false,
            hasImage: false
        }
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()
        return item
    }
    
    
    /**
     * Get Todo record by Id
     * @param id Todo Id
     */
    async getTodoById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        return await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId': id
            }
        }).promise()
    }

    async updateTodoImageFlag(todoId:string){
        await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                'todoId':todoId
            },
            UpdateExpression: 'set  hasImage = :t',
            ExpressionAttributeValues: {
                ':t' : true
            }
          }).promise()
    }

    /**
     * Update existing Todo record
     * @param updatedTodo Update field details
     * @param todoId Todo Id
     */
    async updateTodo(updatedTodo:UpdateTodoRequest,todoId:string){
        await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                'todoId':todoId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n' : updatedTodo.name,
                ':d' : updatedTodo.dueDate,
                ':done' : updatedTodo.done
            },
            ExpressionAttributeNames:{
                "#namefield": "name"
              }
          }).promise()
    }


    /**
     * Delete Todo record
     * @param todoId Todo Id
     */
    async deleteTodoById(todoId: string){
        const param = {
            TableName: this.todosTable,
            Key:{
                "todoId":todoId
            }
        }
         await this.docClient.delete(param).promise()
    }
    
}