// src/controllers/warehouse.controller.ts
import * as express from 'express';
import { ResourceController } from "./core/resource_controller";
import { MongoDbService } from "@services/mongodb.service";
import { IWarehouse } from "@models/warehouse.models";
import { ObjectId } from 'mongodb';

export class WarehouseController extends ResourceController<IWarehouse>{
    constructor(mongodbService: MongoDbService) {
        super(mongodbService);
        this.resourceName = 'warehouses';
    }
    public initializeRoutes(): void {
        this.router.post(this.getPath(), this.createResource as express.RequestHandler);
    }
    public createResource = async (request: express.Request,
        response: express.Response)  =>  {
            try {
                Object.assign(request.body, { warehouseId: new ObjectId() });
                return await super.createResource(request, response);
            } catch (error: any) {
                return response.status(500).send(this.defaultErrorResponse);
            }
    };
  
}