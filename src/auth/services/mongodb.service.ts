import Logger from '@config/Logger';
import * as mongoDB from 'mongodb';

export class AuthMongoDbService {
  private static instance: AuthMongoDbService;

  _primaryDb: mongoDB.Db;
  _secondaryDb: mongoDB.Db;

  private mongoClient(connString: string): mongoDB.MongoClient {
    try {
      const client = new mongoDB.MongoClient(connString, {
        ignoreUndefined: true,
        maxPoolSize: 3,
        minPoolSize: 1,
      });
      client.connect();
      return client;
    } catch (error) {
      Logger.error('Error Connecting to Mongodb');
      throw new Error('Mongo Connection error');
    }
  }

  private constructor(connString: string, dbName: string) {
    this._primaryDb = this.mongoClient(connString)
        .db(dbName);
    this._secondaryDb = this.mongoClient(connString)
        .db(dbName);
  }

  public static getInstance(connString: string,
      dbName: string): AuthMongoDbService {
    if (!AuthMongoDbService.instance) {
      AuthMongoDbService.instance = new AuthMongoDbService(connString, dbName);
    }
    return AuthMongoDbService.instance;
  }

  public getDb(secondary: boolean = false) {
    return secondary ? this._secondaryDb : this._primaryDb;
  }

  public getCollection(name: string, secondary: boolean = false) {
    return this.getDb(secondary).collection(name);
  }

  public isValidObjectId(id: string) {
    return mongoDB.ObjectId.isValid(id);
  }
}
