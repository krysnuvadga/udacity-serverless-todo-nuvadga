/// Imports
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { StorageHelper } from '../../helpers/storageHelper';
import { ResponseHelper } from '../../helpers/responseHelper';
import { TodosRepository } from '../../data/dataLayer/todosRepository'
import { AuthHelper } from '../../helpers/authHelper'
import { createLogger } from '../../utils/logger'


// Variables
const todosAccess = new TodosRepository()
const apiResponseHelper = new ResponseHelper()
const logger = createLogger('todos')
const authHelper = new AuthHelper()


/**
 * Generate upload pre-signed url for todo image upload
 * @param event API getway Event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    // get todo id from path parameters
    const todoId = event.pathParameters.todoId
    
    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])
 
    // get todo item if any
    const item = await todosAccess.getTodoById(todoId)

    // validate todo already exists
    if(item.Count == 0){
        logger.error(`user ${userId} requesting put url for non exists todo with id ${todoId}`)
        return apiResponseHelper.generateErrorResponse(400,'TODO not exists')
    }

    // validate todo belong to authorized user
    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting put url todo does not belong to his account with id ${todoId}`)
        return apiResponseHelper.generateErrorResponse(400,'TODO does not belong to authorized user')
    }
    
    // Generate S3 pre-signed url for this todo
    const url = new StorageHelper().getPresignedUrl(todoId)

    
    return apiResponseHelper
            .generateDataSuccessResponse(200,"uploadUrl",url)
}
