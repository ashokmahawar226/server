import Logger from '@config/Logger';
import * as mongoDB from 'mongodb';

export class MongoDbService {
  _primaryDb: mongoDB.Db;
 // _secondaryDb: mongoDB.Db;

  private mongoClient(connString: string): mongoDB.MongoClient {
    try {
      const client = new mongoDB.MongoClient(connString, {
        ignoreUndefined: true,
        maxPoolSize: 1,
        minPoolSize: 1,
      });
      client.connect();
      Logger.error(' Connected to Mongodb');
      return client;
    } catch (error) {
      Logger.error('Error Connecting to Mongodb');
      throw new Error('Mongo Connection error');
    }
  }

  constructor() {
    this._primaryDb = this.mongoClient(process.env.MONGODB_URI!)
        .db(process.env.DB_NAME);
    // this._secondaryDb = this.mongoClient(process.env.SECONDARY_DB_CONN_STRING!)
    //     .db(process.env.DB_NAME);
  }

  public getDb(secondary: boolean = false) {
   // return secondary ? this._secondaryDb : this._primaryDb;
   return this._primaryDb
  }

  public getCollection(name: string, secondary: boolean = false) {
    return this.getDb(secondary).collection(name);
  }

  public isValidObjectId(id: string) {
    return mongoDB.ObjectId.isValid(id);
  }
}
