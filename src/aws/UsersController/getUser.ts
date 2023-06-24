import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { UsersController } from '../../controllers/UserController';


const controller = new UsersController();

/**
*   Handler for:
*   get /v1/users/{userId}
*
*/
export async function handler (event: APIGatewayEvent): Promise<APIGatewayProxyResult>  {
    try {
        // eslint-disable-next-line prefer-spread
        const result = await controller.getUser.apply(controller, validatedArgs as any);
        return {
            statusCode: undefined,
            body: JSON.stringify(result)
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err)
        };
    }
}