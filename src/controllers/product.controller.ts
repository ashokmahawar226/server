import * as express from 'express'
import { IProduct } from "@models/product";
import { ResourceController } from "./core/resource_controller";
import { MongoDbService } from "@services/mongodb.service";

export class ProductController extends ResourceController<IProduct>{
    constructor(mongodbService: MongoDbService) {
        super(mongodbService);
        this.resourceName = 'products';
    }
    public initializeRoutes(): void {
        this.router.post(this.getPath(),this.createResource as express.RequestHandler)
    }
}
