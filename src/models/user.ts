import { BaseModel } from './shared/base_model';

export interface User extends BaseModel {
  name: string;
  username: string;
  password: string;
  entityId: string;
  status: string;
  roleIds: string[];
}
