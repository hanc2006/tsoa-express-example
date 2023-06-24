import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { UsersController } from '../../controllers/UserController';


const controller = new UsersController();

/**
*   Handler for:
*   post /v1/users
*
*/
export async function handler (event: APIGatewayEvent): Promise<APIGatewayProxyResult>  {
    try {
        // eslint-disable-next-line prefer-spread
        const result = await controller.createUser.apply(controller, validatedArgs as any);
        return {
            statusCode: 201,
            body: JSON.stringify(result)
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err)
        };
    }
}