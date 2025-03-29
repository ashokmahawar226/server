import { BaseModel } from "./shared/base_model";
import { ORDER_STATUS, PLATFORM, STATUS } from "./shared/common";

 export enum ROLE_WARE_HOUSE_OPERSATION{
    MANAGER = 'manager',
    SUPERVISOR = 'supervisor',
    LOGISTICES = 'logistics',
    OTHER = 'OTHER'
}

export interface IWarehouse extends BaseModel {
    warehouseId: string;                    // Unique identifier (e.g., UUID or "WH_MUM_001")
    name: string;                          // Human-readable name (e.g., "Mumbai Warehouse")
    location: {                            // Detailed location information
        addressLine1: string;                // Primary address (e.g., "123 Industrial Road")
        addressLine2?: string;               // Optional secondary address (e.g., "Near BKC")
        city: string;                        // City name (e.g., "Mumbai")
        state: string;                       // State or province (e.g., "Maharashtra")
        country: string;                     // Country (e.g., "India")
        postalCode: string;                   // Postal/ZIP code (e.g., "400051")
        coordinates?: {                      // Optional geolocation coordinates
          latitude: number;                  // Latitude (e.g., 19.0760)
          longitude: number;                 // Longitude (e.g., 72.8777)
        };
    };
    capacity?: number;                     // Optional max storage capacity (in units)
    status: STATUS;         // Operational status of the warehouse
    contact?: {                            // Detailed contact information for warehouse management
        fullName: string;                    // Full name (e.g., "Ravi Kumar Sharma")
        primaryPhone: string;                // Primary contact number (e.g., "+91-9876543210")
        alternatePhone?: string;             // Optional alternate number (e.g., "+91-9123456789")
        email: string;                       // Primary email (e.g., "ravi@warehouse.com")
        alternateEmail?: string;             // Optional alternate email (e.g., "ravi.backup@warehouse.com")
        role: ROLE_WARE_HOUSE_OPERSATION;  // Role in warehouse operations
        availability?: {                     // Optional availability details
          days: string[];                    // e.g., ["Monday", "Tuesday", "Friday"]
          hours: string;                     // e.g., "09:00-17:00 IST"
        };
    }[];
    stocks?: {                               // Stock details for SKUs stored in this warehouse
      sku: string;                         // Unique SKU identifier (e.g., "ABC123")
      quantity: number;                    // Current stock level
      lotNumber?: string;                  // Optional lot/batch number (e.g., "LOT2025")
      reservedQuantity?: number;           // Stock reserved for pending orders
      lastUpdated?: number;                  // Timestamp of last stock update
    }[];
    platformAllocations?: {                 // Stock allocations to specific platforms
      platform: PLATFORM
      sku: string;                         // SKU allocated to this platform
      quantity: number;                    // Stock assigned to the platform
      lastSynced: number;                    // Last synchronization timestamp
    }[];
    orderAssignments?: {                    // Orders assigned to this warehouse
      orderId: string;                     // Unique order identifier (e.g., "ORD123456")
      sku: string;                         // SKU in the order
      quantity: number;                    // Quantity ordered
      status: ORDER_STATUS;  // Order item status
      assignedAt: number;                    // Timestamp of assignment
    }[];
  }