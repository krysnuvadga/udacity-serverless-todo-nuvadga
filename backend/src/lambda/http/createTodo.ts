/// Imports
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/createTodoRequest'
import { AuthHelper } from '../../helpers/authHelper'
import { TodosRepository } from '../../data/dataLayer/todosRepository'
import { ResponseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'


/// Variables
const logger = createLogger('todos')
const authHelper = new AuthHelper()

/**
 * Create new Todo Item
 * @param event API gateway event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    // parse todo field from event body
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])
    logger.info(`create todo for user ${userId} with data ${newTodo}`)

    // Save todo item to database
    const item = await new TodosRepository()
                            .createTodo(newTodo,userId)

    // return success response                            
    return new ResponseHelper()
                .generateDataSuccessResponse(201,'item',item)

}
