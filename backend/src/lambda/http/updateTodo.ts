/// Imports
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { AuthHelper } from '../../helpers/authHelper'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { TodosRepository } from '../../data/dataLayer/todosRepository'
import { ResponseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'

/// Variables
const logger = createLogger('todos')
const todosAccess = new TodosRepository()
const apiResponseHelper = new ResponseHelper()
const authHelper = new AuthHelper()

/**
 * Update existing todo belong to authorized user
 * @param event API getway event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    // get todo id from path parameters
    const todoId = event.pathParameters.todoId

    //Extract update fields from event body
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    
    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])
  
    // get todo item if any
    const item = await todosAccess.getTodoById(todoId)
  
    // validate todo already exists
    if(item.Count == 0){
        logger.error(`user ${userId} requesting update for non exists todo with id ${todoId}`)
        return apiResponseHelper.generateErrorResponse(400,'TODO not exists')
    } 

    // validate todo belong to authorized user
    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting update todo does not belong to his account with id ${todoId}`)
        return apiResponseHelper.generateErrorResponse(400,'TODO does not belong to authorized user')
    }

    logger.info(`User ${userId} updating group ${todoId} to be ${updatedTodo}`)

    // update todo 
    await new TodosRepository().updateTodo(updatedTodo,todoId)

    return apiResponseHelper.generateEmptySuccessResponse(204)
}
