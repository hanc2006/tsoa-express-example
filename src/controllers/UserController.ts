import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  Response,
} from 'tsoa'
import { User } from '../models/UserModel'
import { UsersService } from '../services/UserService'
import { HttpResponseError as Pippo } from '../models/ExceptionModel';


@Route('users')
export class UsersController extends Controller {

  @Response('404', 'Not found')
  @Get('{userId}')
  public async getUser(
    @Path() userId: number,
    @Query() name?: string
  ): Promise<User | Pippo> {
    return new UsersService().get(userId, name)
  }

  // @SuccessResponse('201', 'Created')
  // @Post()
  // public async createUser(
  //   @Body() requestBody: UserCreationParams
  // ): Promise<void> {
  //   this.setStatus(201) // set return status 201
  //   new UsersService().create(requestBody)
  //   return
  // }
}
