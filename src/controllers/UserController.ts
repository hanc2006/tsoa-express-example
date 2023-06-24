import {
  Body,
  Controller,
  Get,
  Path,
  Query,
  Route,
  SuccessResponse,
  Post,
  Response
} from 'tsoa'
import { User } from '../models/UserModel'
import { UserCreationParams, UsersService } from '../services/UserService'
import { Exception, errors } from '../models/ExceptionModel';

@Route('users')
export class UsersController extends Controller {

  @Response<{error: 'ERR_NUTE_API' | 'ERR_FROM_PRODUCT_CATALOG_API'}>(500)
  //@Exception(errors, ['ERR_INVALID_ADDRESS', 'ERR_NUTE_API', 'ERR_FROM_PRODUCT_CATALOG_API'])
  @Get('{userId}')
  public async getUser(
    @Path() userId: number,
    @Query() name?: string
  ): Promise<User> {
    const user = new UsersService().get(userId, name);
    if (user) return user;

    throw new Error('ERR_ACCOUNT_NOT_FOUND')
  }

  @SuccessResponse('201', 'Created')
  @Post()
  public async createUser(
    @Body() requestBody: UserCreationParams
  ): Promise<void> {
    this.setStatus(201) // set return status 201
    new UsersService().create(requestBody)
    return
  }
}
