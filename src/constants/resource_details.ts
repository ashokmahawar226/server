export const ResourceDetails: ResourceDetailObject = {
  'products': {
    path: '/products',
    collection: 'products',
  },
  'users':{
    path: '/users',
    collection: 'users',
  },
  'warehouses':{
    path : '/warehouses',
    collection : 'warehouses'
  }
};

export interface ResourceDetailObject {
  [key: string]: {
    path: string;
    collection: string;
    subResources?: ResourceDetailObject;
  }
}
