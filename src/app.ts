import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import Logger from '@config/Logger';
import timeout from 'connect-timeout';
import { validateToken } from '@middleware/auth.middleware';
// import {AuthService} from './auth/auth.service';

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: any, eventProcessors: any, port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeEventProcessors(eventProcessors);
  }

  private initializeMiddlewares() {
    Logger.debug('Initializing Middlewares');
    this.app.use(cors());
    this.app.use(timeout('360s'));
    this.app.use(bodyParser.json());
   this.app.use(validateToken)
  }

  private initializeControllers(controllers: any) {
    Logger.debug('Initializing Controllers');
    controllers.forEach((controller: any) => {
      controller.initializeRoutes();
      this.app.use('/', controller.router);
    });
  }

  private initializeEventProcessors(eventProcessors: any) {
    Logger.debug('Initializing Event Processors');
    eventProcessors.forEach((eventProcessor: any) => {
      eventProcessor.startConsumer();
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      Logger.info(`server started on port ${this.port}`);
    });

    // new AuthService(
    //     {
    //       'connString': process.env.PRIMARY_DB_CONN_STRING!,
    //       'dbName': process.env.DB_NAME!,
    //     },
    //     this.app,
    //     process.env.SYSTEM_DEFAULT_ENTITY_LEGAL_NAME!);
  }
}

export default App;
