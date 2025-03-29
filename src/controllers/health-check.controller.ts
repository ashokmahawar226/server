import * as express from 'express';

export class HealthCheckController {
  // eslint-disable-next-line new-cap
  public router = express.Router();
  public initializeRoutes() {
    this.router.get('/health', this.healthCheck);
  }

  public healthCheck = (req: express.Request, res: express.Response) => {
    res.status(200).send({status: 'OK'});
  };
}
