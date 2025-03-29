import * as express from 'express';
import jwt from 'jsonwebtoken';
import {User} from '../models/user';
import {ResourceController} from './core/resource_controller';
import CryptoJS from 'crypto-js';
import {
  AuthError,
  UnauthorizedError,
  UnprocessableError,
} from '../error/auth_error';
import {Json} from '../models/shared/Json';
import {Request} from 'express';
import AuthLogger from '@config/Logger';
import { MongoDbService } from '@services/mongodb.service';

export class UsersController extends ResourceController<User> {
  constructor(mongodbService: MongoDbService) {
    super(mongodbService);
    this.resourceName = 'users';
  }

  public initializeRoutes(): void {
    super.initializeRoutes();
    this.router.post(this.getPath() + '/login', 
      (this.authenticateUser as unknown) as express.RequestHandler);
  }

  protected getPassedFilters(req: Request): Json {
    const filters: Json = super.getPassedFilters(req);
    const requestFilters = req.query.filters ?
       JSON.parse(req.query.filters as string) : {};
    if (requestFilters['entityId']) {
      filters['entityId'] = requestFilters['entityId'];
    }
    return filters;
  }

  private validateUser(resource: User) {
    if (!resource['name']) {
      throw new AuthError('', [{
        field: 'name',
        error: 'Name is mandatory.',
        value: undefined,
      }]);
    }
    if (!resource['username']) {
      throw new AuthError('', [{
        field: 'username',
        error: 'Username is mandatory.',
        value: undefined,
      }]);
    }
    if (!resource['password']) {
      throw new AuthError('', [{
        field: 'password',
        error: 'Password is mandatory.',
        value: undefined,
      }]);
    }
    if (!resource['entityId']) {
      throw new AuthError('', [{
        field: 'entityId',
        error: 'Entity is mandatory.',
        value: undefined,
      }]);
    }
    if (!resource['status']) {
      throw new AuthError('', [{
        field: 'status',
        error: 'Status is mandatory.',
        value: undefined,
      }]);
    }
    if (!resource['roleIds']) {
      throw new AuthError('', [{
        field: 'roleIds',
        error: 'RoleIds is mandatory.',
        value: undefined,
      }]);
    }
  }

  public authenticateUser = async (req: express.Request,
      res: express.Response) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const user = await this.authenticate(username, password);
   
      const tokenObj: any = {};
     
      tokenObj['username'] = user.username;
      tokenObj['password'] = user.password;

      const secretKey = process.env.JWT_SECRET!;
    
      const token = jwt.sign(tokenObj, secretKey, {});
      return res.status(200).send(
          {token, user},
      );
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        return res.status(401).send('Invalid credentials.');
      }
      AuthLogger.error(`Error occurred while authenticating user, ${error}`);
      return res.status(500).send(this.defaultErrorResponse);
    }
  };

  public async authenticate(username: string, password: string) {
    // eslint-disable-next-line new-cap
    const hashedPassword: String = CryptoJS.SHA256(String(password))
        .toString(CryptoJS.enc.Hex);
    const users = await this.findResources({
      username: username,
      password: hashedPassword,
      status: 'ACTIVE',
      deleted: false,
    });
    if (users && users.length > 0) {
      return Promise.resolve(users[0]);
    }
    throw new UnauthorizedError('Invalid User', []);
  }

  protected async afterCreate(_resource: User,
      source?: String): Promise<void> {
    await super.afterCreate(_resource, source);
  }

  protected async afterUpdate(_resource: User, _oldResource: User,
      _input: Json, source?: string): Promise<void> {
    await super.afterUpdate(_resource, _oldResource, _input);
  }

  public async blockAllEntityAssociatedUsers(entityId: string) {
    await this.updateResourceByFilter({
      entityId: entityId,
      status: 'ACTIVE',
      deleted: false,
    }, {
      status: 'BLOCKED',
      lastUpdatedAt: Date.now(),
    });
  }
}
