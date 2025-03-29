import { ISeller } from "./seller";
import { BaseModel } from "./shared/base_model";
import {  Discount, PLATFORM, Currency, LISTING_STATUS, ORDER_STATUS } from "./shared/common";



export interface IProduct extends BaseModel {
  id: string;                            // Unique identifier (e.g., "PROD_ABC123")
  fsn: string;                          // Flipkart Serial Number (e.g., "TSH123456789")
  listingId?: string;                   // Flipkart Listing ID (e.g., "LSTTSH123456789")
  name: string;                         // Product name (e.g., "Blue Cotton T-Shirt")
  brand: string;                        // Brand name (e.g., "Nike")
  category: string;                     // Main category (e.g., "Clothing")
  subCategory?: string;                 // Optional subcategory (e.g., "T-Shirts")
  description?: string;                 // Product description (Flipkart requirement)
  hsnCode?: string;                     // HSN code for tax (e.g., "6109")
  taxRate?: number;                     // Tax rate percentage (e.g., 5 for GST)
  mrp: number;                          // Maximum Retail Price (e.g., 599.99)
  sellingPrice: number;                 // Selling price after discount (e.g., 499.99)
  currency: Currency;                   // Currency (default "INR" for Flipkart)
  availability: boolean;                // Availability status (true/false)
  returnPolicy?: string;                // Return policy (e.g., "10 days replacement")
  warranty?: string;                    // Warranty details (e.g., "1 year")
  images?:string[]
  attributes?: {                        // Flipkart-specific attributes (e.g., size, color)
    [key: string]: string | number;     // e.g., { "size": "M", "color": "Blue" }
  };
  seller: ISeller;
  stock: {                              // Stock details across warehouses
    warehouseId: string;                // Warehouse ID (e.g., "WH_MUM_001")
    sku: string;                        // Stock Keeping Unit (e.g., "ABC123")
    quantity: number;                   // Current stock level
    lotNumber?: string;                 // Optional lot/batch number (e.g., "LOT2025")
    reservedQuantity?: number;          // Stock reserved for pending orders
    lastUpdated?: number;               // Timestamp of last stock update (Unix ms)
  }[];
  platformAllocations: {                // Platform-specific allocations (Flipkart focus)
    platform: PLATFORM;                 // Platform (e.g., "flipkart")
    listingId?: string;                 // Platform-specific listing ID (e.g., "LSTTSH123456789")
    sku: string;                        // SKU allocated (e.g., "ABC123")
    quantity: number;                   // Stock assigned to platform
    listingStatus: LISTING_STATUS;      // Status of listing (e.g., "active")
    lastSynced: number;                 // Last sync timestamp (Unix ms)
  }[];
  totalStockCount: number;              // Total stock across all warehouses
}




