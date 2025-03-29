export enum Currency {
  INR = 'INR',  // Default for Flipkart
  USD = 'USD',
  EUR = 'EUR',
}

enum IDiscountType{
  FLAT = 'FLAT',
  PERCENT = 'PERCENT'
}

export enum PLATFORM{
    AMAZON='AMAZON',
    FLIPKART = 'FLIPKART',
    EBAY = 'EBAY',
    MYNTRA = 'MYNTRA',
    MEESHO = 'MEESHO'
}

export interface Discount{
  type:IDiscountType,
  value:number
}

export enum FULLFILLMENTTYPE {
  SELLER = 'SELLER',
  FLIPKART_FBF = 'FLIPKART_FBF',
  FLIPKART_FBF_LITE = 'FLIPKART_FBF_LITE',
  AMAZON_FBA = 'AMAZON_FBA',
  SELF_SHIP = 'SELF_SHIP'
}

export enum  STATUS {
  INACTIVE = 'inactive',
  ACTIVE = 'active'
}

export enum ORDER_STATUS {
  PENDING = 'pending',
  FULLFILLED = 'fulfilled',
  CANCELLED = 'cancelled'
}

export enum LISTING_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}
