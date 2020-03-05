/// Imports
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { AuthHelper } from '../../helpers/authHelper'
import { TodosRepository } from '../../data/dataLayer/todosRepository'
import { StorageHelper } from '../../helpers/storageHelper'
import { ResponseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'

/// Variables
const s3Helper = new StorageHelper()
const apiResponseHelper= new ResponseHelper()
const logger = createLogger('todos')
const authHelper = new AuthHelper()

/**
 * Get authorized user todos list
 * @param event API gateway Event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization']) 
    logger.info(`get groups for user ${userId}`)

    // Get user's Todos
    const result = await new TodosRepository().getUserTodos(userId)
    
    // Generate todos pre-signed get url for todos with uploaded images
    for(const record of result){
        if(record.hasImage){
            record.attachmentUrl = await s3Helper.getTodoAttachmentUrl(record.todoId)
        }
    }

    // return success response
    return apiResponseHelper.generateDataSuccessResponse(200,'items',result)
}