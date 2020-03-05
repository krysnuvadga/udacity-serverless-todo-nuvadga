import {  APIGatewayProxyResult } from 'aws-lambda'


/**
 * Helper method to return Lambda function response
 * Including Access-Control-Allow-Origin header
 */
export class ResponseHelper{

    /**
     * generate success response with custom result objecct name
     * @param statusCode Response http status code
     * @param key result object name
     * @param items result object
     */
    generateDataSuccessResponse(statusCode: number,key: string, items: any): APIGatewayProxyResult{
        return {
            statusCode: statusCode,
            headers:{
              'Access-Control-Allow-Origin':'*'
            },
            body: JSON.stringify({
              [key]:items
            })
          }
    }
    
    /**
     * generate empty response
     * @param statusCode Response http status code
     */
    generateEmptySuccessResponse(statusCode: number): APIGatewayProxyResult{
        return {
            statusCode: statusCode,
            headers:{
              'Access-Control-Allow-Origin':'*'
            },
            body: null
          }
    }

    /**
     * generate error response 
     * @param statusCode Response http status code
     * @param message Error message
     */
    generateErrorResponse(statusCode: number,message:string): APIGatewayProxyResult{
        return {
            statusCode: statusCode,
            headers:{
              'Access-Control-Allow-Origin':'*'
            },
            body: JSON.stringify({
              message
            })
          }
    }
}