/// Imports
import 'source-map-support/register'
import { S3Event,S3Handler } from 'aws-lambda'
import { TodosRepository } from '../../data/dataLayer/todosRepository'
import { createLogger } from '../../utils/logger'

/// Variables
const logger = createLogger('todos')
const todosAccess = new TodosRepository()

/**
 * Get authorized user todos list
 * @param event API gateway Event
 */
export const handler: S3Handler = async (event: S3Event): Promise<void> => {
    const fileName = event.Records[0].s3.object.key
    logger.info(`File uploaded ${fileName}`)
    //authHeader.split(' ')
    const todoId =  fileName.split('.')[0]
    const item = await todosAccess.getTodoById(todoId)
    if(item.Count == 1){
        await todosAccess.updateTodoImageFlag(todoId)
    }else{
        logger.error(`File uploaded ${fileName} not matching a todo`)
    }
}