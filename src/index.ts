import dotenv from 'dotenv';
dotenv.config();
import App from './app';
import Logger from '@config/Logger';
import { MongoDbService } from '@services/mongodb.service';
import { HealthCheckController } from '@controllers/health-check.controller';
import { ProductController } from '@controllers/product.controller';
import { UsersController } from '@controllers/user.controller';
import { WarehouseController } from '@controllers/warehouse.controller';
Logger.debug('Creating Controller instances');
const mongodbService = new  MongoDbService()
const app = new App(
    [
        new HealthCheckController(),
        new ProductController(mongodbService),
        new UsersController(mongodbService),
        new WarehouseController(mongodbService)
    ],
    [
     
    ],
    8085,
);
app.listen();
