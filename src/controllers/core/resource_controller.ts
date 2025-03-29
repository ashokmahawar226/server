import * as express from 'express';
import {MongoDbService} from '../../services/mongodb.service';
import {BaseModel} from '../../models/shared/base_model';
import {ResourceDetails} from '../../constants/resource_details';
import {Json} from '../../models/shared/Json';
import {ClientSession, Document, FindOptions, MongoServerError,
  ObjectId, Sort, UpdateFilter, UpdateOptions} from 'mongodb';
import Logger from '@config/Logger';
import { BaseSchema } from 'src/validation/base.schema';
import { AuthError, ForbiddenError, NotFoundError, UnauthorizedError } from 'src/error/auth_error';
import { Audit } from '@models/audit.models';

export class ResourceController <T extends BaseModel> {
  protected resourceName = '';
  protected _mongodbService: MongoDbService;
  readonly namespace = '';
  protected hasImages = false;
  readonly cdnPath = process.env.CDN_PATH;
  protected userIdInModel = false;
  protected entityIdInModel = false;
  protected validationSchema  = BaseSchema;

  protected defaultErrorResponse = {
    error: 'Something went wrong, Please try again later!',
  };

  protected defaultNotFoundResponse = {
    error: 'Resource not found!',
  };

  // eslint-disable-next-line new-cap
  public router = express.Router();

  constructor(mongodbService: MongoDbService) {
    this._mongodbService = mongodbService;
  }

  public initializeRoutes() {
    // eslint-disable-next-line max-len
    Logger.debug(`Initializing routes for resource name: ${this.getResourceName()} , with path: ${this.getPath()}`);
    this.router.get(this.getPath(), this.listResource as express.RequestHandler );
    this.router.get(this.getPath() + '/:id', this.getResource as express.RequestHandler );
    this.router.post(this.getPath(), this.createResource as express.RequestHandler);
    this.router.put(this.getPath() + '/:id', this.updateResource as express.RequestHandler);
    this.router.delete(this.getPath() + '/:id', this.deleteResource as express.RequestHandler);
    this.router.delete(this.getPath(), this.bulkDelete);
  }

  public getResourceName(): string {
    return this.resourceName;
  }

  protected getPath(): string {
    Logger.error(`getPath: ${this.getResourceName()}`);
    const resourceDetails = ResourceDetails[this.getResourceName()];
    if (!resourceDetails) {
      // eslint-disable-next-line max-len
      Logger.error(`Invalid resource details for resource name: ${this.getResourceName()}`);
      throw Error('Path is not configured for resource: ' +
       this.getResourceName());
    }
    return resourceDetails.path;
  }

  protected getCollectionName(): string {
    const resourceDetails = ResourceDetails[this.resourceName];
    if (!resourceDetails) {
      // eslint-disable-next-line max-len
      Logger.error(`Invalid resource details for resource name: ${this.getResourceName()}`);
      throw Error('Collection details are not configured for resource: ' +
       this.getResourceName());
    }
    return resourceDetails.collection;
  }

  protected getResourceCollection(secondary?: boolean) {
    return this._mongodbService.getCollection(this.getCollectionName(),
        secondary);
  }

  public async deleteObjects(filter: Json) {
    await this.getResourceCollection().deleteMany(filter);
  }

  public async updateResourceObjects(filter: Json, update: Json, session?: ClientSession) {
    Logger.info(`updating resources of type ${this.getResourceName()} with
    filter:: ${JSON.stringify(filter)}, with data ${JSON.stringify(update)}`);
    return this.getResourceCollection().updateMany(filter, update, {session});
  }

  public findUserIdFromToken(req: express.Request, res: express.Response): string {
    try {
      return res.locals.user.id!;
    } catch (error: any) {
      Logger.error(`error fetching user from token: ${error.stack}`);
      if (error instanceof AuthError) {
        throw error;
      } else {
        throw new AuthError('Invalid token', []);
      }
    }
  }

  public findUserFromToken(_req: express.Request, _res: express.Response) {
    console.log(_req)
    return _res.locals.user;
  }

  public async createResource(request: express.Request, response: express.Response) {
    try {
      const loggedInUser = this.findUserFromToken(request, response);
      Object.assign(request.body, {lastUpdatedBy: loggedInUser.username, createdBy: loggedInUser.username});
      const body = request.body;
      const resource: T = await this.create(body, response.locals.user);
      this.auditLogAfterResponse(request, response);
      response.status(200).send(resource);
    } catch (error: any) {
        Logger.error(`Error while creating resource: ${error}`);
        return response.status(500).send(this.defaultErrorResponse);
      
    }
  };

  public async listResource (req: express.Request, res: express.Response) {
    const startTime = Date.now();
    try {
      const offset = req?.query?.offset ? +req.query.offset : 0;
      const limit = req?.query?.limit ? +req.query.limit : 10;
      const order = req?.query?.order ? String(req?.query?.order) : 'desc';
      const sort = req?.query?.sort ? String(req?.query?.sort) : 'createdAt';
      let filters: Json = {};
      if (this.entityIdInModel) {
        filters = this.getFiltersBasedOnEntity(req, res);
      } else {
        filters = this.getPassedFilters(req, res);
      }
      if (this.userIdInModel) {
        filters['userId'] = this.findUserIdFromToken(req, res);
      }
      // eslint-disable-next-line max-len
      Logger.debug(`List resource of type: ${this.getResourceName()}, with filters: ${JSON.stringify(filters)}, and offset: ${offset}`);
      const resourcesCount: number = await this.countResources(filters);
      let resources: T[] = [];
      resources = await this.findResources(filters, limit, offset,
          [[sort, order === 'asc' ? 1 : -1]]);
      let response = {
        count: resourcesCount,
        list: resources,
      };
      response = await this.editResponse(response, filters);
      res.status(200).send(response);
    } catch (error: any) {
      if (error instanceof AuthError) {
        Logger.error(error);
        return res.status(400).send(error.errorObject);
      }
      Logger.error('Error listing resources: ' + error.stack);
      return res.status(500).send(this.defaultErrorResponse);
    } finally {
     // metricService.emitLatencyMetrics(req.path, Date.now() - startTime);
    }
  };


  public async bulkWrite(resources: Json, session?: ClientSession) {
    try {
      const r: any = resources;
      await this.getResourceCollection().bulkWrite(r, {session});
    } catch (error: any) {
      if (error instanceof MongoServerError) {
       // throw this.handleMongoServerError(error);
      }
      throw error;
    }
  }

  public updateResource = async (request: express.Request,
      response: express.Response) => {
    try {
      // delete req.body['deleted']; // deleted has its own route -> DELETE
      const updatedResource = await this.update(request.params.id, request.body,
          undefined, response.locals.user);
       response.status(200).send(updatedResource);
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        return response.status(404).send();
      } else if (error instanceof ForbiddenError) {
        return response.status(403).send(error.errorObject);
      } else if (error instanceof UnauthorizedError) {
        return response.status(401).send(error.errorObject);
      } else {
        // eslint-disable-next-line max-len
        Logger.error(`Error while updating resource with id: ${request.params.id}, error: ${error.stack}`);
        return response.status(500).send(this.defaultErrorResponse);
      }
    }
  };

  protected transformResource(result: any): T {
    if (!result) {
      return result;
    }
    const r = {id: String(result._id)};
    delete result._id;
    const resource: T = {
      ...r,
      ...result,
    } as unknown as T;
    return resource;
  }

  protected async transformResources(results: any[]): Promise<T[]> {
    const records = results.map((record) => {
      return this.transformResource(record);
    });
    return Promise.resolve(records as unknown as T[]);
  }

  public async countResources(filters: Json) {
    return this.getResourceCollection().countDocuments(filters);
  }

  public getResource = async (request: express.Request,
      response: express.Response) => {
    try {
      const query = {_id: new ObjectId(request.params.id)};
      Logger.debug(`query: ${JSON.stringify(query)}`);
      const resource: T = await this.findResource(request.params.id);
      return response.status(200).send(resource);
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        return response.status(404).send('resource not found!');
      }
      // eslint-disable-next-line max-len
      Logger.error(`Error while fetching resource with id: ${request.params.id}, error: ${error.stack}`);
      response.status(500).send(error);
    }
  };

  public async create(resource: Partial<T>, loggedInUser?: Json, session?: ClientSession): Promise<T> {
    try {
      // eslint-disable-next-line max-len
      Logger.debug(`creating resource of type: ${this.getResourceName()}, with data: ${JSON.stringify(resource)}`);
      await this.beforeCreate(resource, loggedInUser);
      const r: any = resource;
      await this.getResourceCollection().insertOne(r, {session});
      const res: T = this.transformResource(resource);
      const output = await this.afterCreate(res, loggedInUser);
      return Promise.resolve({
        ...res,
        ...output,
      });
    } catch (error: any) {
      if (error instanceof MongoServerError) {
      //  throw this.handleMongoServerError(error);
      }
      Logger.error(`Error creating resource, error: ${error.stack}`);
      throw error;
    }
  }

  public async createAll(resources: T[], source?: string, session?: ClientSession): Promise<T[]> {
    try {
      const r: any = resources;
      await this.getResourceCollection().insertMany(r, {session});
      return Promise.resolve(resources);
    } catch (error: any) {
      if (error instanceof MongoServerError) {
       // throw this.handleMongoServerError(error);
      }
      Logger.error(`Error creating resources, error: ${error.stack}`);
      throw error;
    }
  }

  public async beforeCreate(resource: Partial<T>, loggedInUser?: Json): Promise<void> {
    resource.createdAt = Date.now();
    resource.deleted = resource.deleted || false;
    if (loggedInUser) {
        resource.createdBy = loggedInUser.username;
    }
    if (this.validationSchema) {
       // await this.validationSchema.validateAsync(resource, { abortEarly: false });
    } else {
       // await this.validateResource(resource as T);
    }
  }

  public async auditLogAfterResponse(req: express.Request, res: express.Response) {
    const audit: Audit = {
      path: req.path,
      method: req.method,
      requestBody: req.body,
      username: res.locals.user?.username || 'anonymous',
      timestamp: Date.now(),
    };
    this._mongodbService.getCollection('audit').insertOne(audit);
  };

  protected async afterCreate(_resource: T, _loggedInUser?: Json): Promise<any> {}

  protected async afterUpdate(_resource: T, _oldResource: T,
      _input: Json): Promise<void> {}



  public async updateResourceById(resourceId: string,
      update: UpdateFilter<Json> | Partial<Json>, _options?: UpdateOptions) {
    await this.getResourceCollection().updateOne(
        {_id: new ObjectId(resourceId)}, update);
  }

  public async update(resourceId: string, input: Json,
      resource?: T, loggedInUser?: Json): Promise<T> {
    try {
      // eslint-disable-next-line max-len
      Logger.debug(`updating resource of type: ${this.getResourceName()}, with data: ${JSON.stringify(input)}`);
      if (!resource) {
        resource = await this.findResource(resourceId);
      }
      // remove all null values from input
      input = this.removeNullValuesFromObject(input);
      await this.beforeUpdate(resource, input, resourceId, loggedInUser);
      const dirtyResponse = {
        ...resource,
        ...input,
      };
      const updatedResource: T = dirtyResponse;
      if (this.validationSchema) {
      //  await this.validationSchema.parseAsync(updatedResource);
      } else {
       // await this.validateResource(updatedResource);
      }
      await this.getResourceCollection().updateOne(
          {_id: new ObjectId(resourceId)}, {$set: updatedResource});
      updatedResource.id = resourceId;
      await this.afterUpdate(updatedResource, resource, input);
      return Promise.resolve(updatedResource);
    } catch (error: any) {
      Logger.error(`Error updating resource, error: ${error.stack}`);
      throw error;
    }
  }

 


  public async findResource(resourceId: string): Promise<T> {
    // eslint-disable-next-line max-len
    Logger.debug(`finding resource ${this.getResourceName()}, with id: ${resourceId}`);
    const query = {_id: new ObjectId(resourceId)};
    const result = await this.getResourceCollection()
        .findOne(query) as unknown as T;
    if (result) {
      const resource = this.transformResource(result);
      return Promise.resolve(resource);
    } else {
      Logger.error(`Resource not found id: ${resourceId}`);
      throw new NotFoundError('', []);
    }
  }

  public async findResources(filters: Json, limit?: number, offset?: number,
      sort?: Sort): Promise<T[]> {
    // eslint-disable-next-line max-len
    Logger.debug(`finding resources ${this.getResourceName()}, with filters: ${JSON.stringify(filters)}`);
    let filterIds = filters._id;
    if (filterIds && filterIds['$in']) {
      filterIds = filterIds['$in'];
    } else if (filterIds) {
      filterIds = [filterIds];
    }
    const resources = await this.findResourcesFromDb(filters, limit, offset,
        sort);

    return Promise.resolve(resources);
  }

  public findCursor(filters: Json, limit?: number, offset?: number,
      sort?: Sort) {
    // eslint-disable-next-line max-len
    Logger.debug(`finding resources ${this.getResourceName()}, with filters: ${JSON.stringify(filters)}`);
    return this.getResourceCollection(true).find(
        filters, {limit: limit, skip: offset, sort: sort});
  }

  public deleteResource = async (request: express.Request,
      response: express.Response) => {
    try {
      const resourceId = request.params.id;
      const resource = await this.delete(resourceId);
      this.auditLogAfterResponse(request, response);
      response.status(200).send(resource);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return response.status(404).send();
      }
      
      // eslint-disable-next-line max-len
      Logger.error(`Error while deleting resource with id: ${request.params.id}, error: ${error}`);
      return response.status(500).send(this.defaultErrorResponse);
    }
  };

  public async delete(resourceId: string, _loggedInUser?: Json) {
    try {
      // eslint-disable-next-line max-len
      Logger.debug(`Deleting resource of type ${this.getResourceName()}, with id: ${resourceId}`);
      const resource = await this.update(resourceId, {deleted: true}, undefined, _loggedInUser);
      return Promise.resolve(resource);
    } catch (error) {
      throw error;
    }
  }

  public bulkDelete = async (request: express.Request,
      response: express.Response) => {
    try {
      const resourceIds = request.body.resourceIds as string[];
      Logger.debug(`Deleting resources of type ${this.getResourceName()}, with ids: ${resourceIds}`);
      await this.updateResourceObjects(
          {_id: {$in: resourceIds.map((id: string) => ObjectId.createFromHexString(id))}}, {$set: {deleted: true}},
      );
      this.auditLogAfterResponse(request, response);
      response.status(200).send({message: `Bulk deletion successful!`});
    } catch (error) {
      throw error;
    }
  };

  // eslint-disable-next-line max-len
  protected getPassedFilters(_req: express.Request, _res?: express.Response): Json {
    const filters: Json = {deleted: false};
    return filters;
  }

  protected getFiltersBasedOnEntity(_req: express.Request, _res: express.Response): Json {
    const filters: Json = {deleted: false};
    const entityId = _req.query.entityId;
    const loggedInUser = _res.locals.user;
    if (loggedInUser.entityId && loggedInUser.entityId !== entityId) {
      throw new UnauthorizedError('loggedInUser does not belong to this entity', []);
    }
    if (entityId) {
      filters['entityId'] = entityId;
    } else {
      throw new UnauthorizedError('entityId is missing!', []);
    }
    return filters;
  }

  private async findResourcesFromDb(filters: Json, limit?: number,
      offset?: number, sort?: Sort, projection?: Document): Promise<T[]> {
    const result = await this.getResourceCollection(true).find(
        filters, {limit: limit, skip: offset, sort: sort,
          projection: projection}).toArray() as unknown as T[];
    const resources = await this.transformResources(result);
    return Promise.resolve(resources);
  }

  protected async beforeUpdate(resource: T, _input: Json,
      _resourceId: string, _loggedInUser?: Json): Promise<void> {
    resource.lastUpdatedAt = Date.now();
    if (_loggedInUser) {
      resource.lastUpdatedBy = _loggedInUser.username;
    }
  }

  public async updateResourceObject(resource: Partial<T>) {
    try {
      resource.lastUpdatedAt = new Date().getTime();
      await this.getResourceCollection().updateOne(
          {_id: new ObjectId(resource.id)},
          {$set: resource},
      );
    } catch (error) {
      Logger.error(`Error updating resource object, error: ${error}`);
    }
  }

  public async updateResourceByFilter(filter: Json,
      update: UpdateFilter<Json> | Partial<Json>, options?: UpdateOptions,
      findOptions?: FindOptions) {
    // eslint-disable-next-line max-len
    Logger.debug(`updating resource of type: ${this.getResourceName()}, with data: ${JSON.stringify(update)}`);
    const r = await this.getResourceCollection().findOne(filter, findOptions);
    const resource = this.transformResource(r);
    if (r) {
      await this.updateResourceObject(resource);
    } else {
      if (options?.upsert) {
        await this.getResourceCollection().updateOne(
            filter,
            update,
            options,
        );
      }
    }
  }


  public async upsertResourceByFilter(filter: Json,
      update: UpdateFilter<Json> | Partial<Json>, options?: UpdateOptions,
      findOptions?: FindOptions) {
    // eslint-disable-next-line max-len
    Logger.debug(`upserting resource of type: ${this.getResourceName()}, with data: ${JSON.stringify(update)}`);
    const r = await this.getResourceCollection().findOne(filter, findOptions);
    const resource = this.transformResource(r);
    if (r) {
      await this.updateResourceById(resource.id!, update);
      return {upsertedId: new ObjectId(resource.id)};
    } else {
      if (options?.upsert) {
        return await this.getResourceCollection().updateOne(
            filter,
            update,
            options,
        );
      }
    }
  }

  public async updateResourcesByFilter(filter: Json,
      update: UpdateFilter<Json> | Partial<Json>, session?: ClientSession) {
    return await this.getResourceCollection().updateMany(filter, update, {session});
  }

  protected async editResponse(response: any, _filters:any): Promise<any> {
    return response;
  }

  private removeNullValuesFromObject(obj: any) {
    for (const key in obj) {
      if (obj[key] == null) {
        delete obj[key];
      }
    }
    return obj;
  }
}
