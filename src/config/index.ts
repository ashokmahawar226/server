import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoURI: string;
  mongoURITest: string;
  jwtSecret: string;
  jwtExpiration: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
  mongoURITest: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/mydatabase_test',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
};
