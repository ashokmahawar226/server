import { BaseModel } from "./shared/base_model";
import { PLATFORM } from "./shared/common";
  export interface ProductMetadata extends BaseModel {
    productId: string;
    platform: PLATFORM;
    keywords: string[];
    seoDescription: string;
  }