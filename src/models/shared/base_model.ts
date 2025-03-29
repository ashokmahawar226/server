export interface BaseModel {
  id?: string;
  createdAt?: number;
  lastUpdatedAt?: number;
  deleted?: boolean;
  createdBy?: string;
  lastUpdatedBy?:string
}


