import { BaseModel } from "./shared/base_model";
import { PLATFORM } from "./shared/common";

export interface ProductStock extends BaseModel {
    productId: string;
    platform: PLATFORM;
    stockCount: number;
    price: number;
}