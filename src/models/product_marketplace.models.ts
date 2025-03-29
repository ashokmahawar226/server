import { BaseModel } from "./shared/base_model";
import { Discount, PLATFORM } from "./shared/common";

export interface ProductMarketplace extends BaseModel {
    productId: string; // References main Product ID
    platform: PLATFORM;
    description?: string[];
    images: string[];
    url: string;
    specifications?: Record<string, string | number>;
    price: number;
    discount?: Discount;
    finalPrice: number;
    stockCount: number;
    availability: boolean;
  }
  