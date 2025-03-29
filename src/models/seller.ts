import { platform } from "os";
import { BaseModel } from "./shared/base_model";
import { FULLFILLMENTTYPE, PLATFORM } from "./shared/common";
import { IWarehouse } from "./warehouse.models";

export interface ISeller extends BaseModel {
    sellerId: string;  // Unique seller identifier
    name: string;  // Seller's name or brand name
    email: string;
    phone: string;
    secondaryPhone?:string
    gstNumber?: string;  // GSTIN for tax compliance
    panNumber?: string;  // PAN number for financial records
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
    };
    warehouses?: string[]; // warehouses ids 
    fulfillmentType?: {
        [key in PLATFORM]?: FULLFILLMENTTYPE;
    };
    ratings?: {
        averageRating: number;
        reviewCount: number;
    };

    registeredOn: number;  // Timestamp of registration (Epoch time)
    isVerified: boolean;  // Whether the seller is verified by platforms
    paymentDetails?: {
        [key in PLATFORM]:{
            bankName: string;
            accountNumber: string;
            ifscCode: string;
            upiId?: string;
        }
    };
    platforms?: {
        [key in PLATFORM] : {
            sellerId: string;
            storeUrl: string;
        }
    };
}
