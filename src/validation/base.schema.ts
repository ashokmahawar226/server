import Joi from 'joi';
import {ObjectId} from 'mongodb';

export const BaseSchema = {
  id: Joi.string().default('').optional(),
  createdAt: Joi.number().default(0).optional(),
  lastUpdatedAt: Joi.number().default(0).optional(),
  deleted: Joi.boolean().default(false).optional(),
  lastUpdatedBy: Joi.string().optional(),
  entityId: Joi.string().optional(),
  createdBy: Joi.string().optional(),
};


export const objectId = () => Joi.string().custom((value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.error('Not a Valid Mongo ID');
  }
  return value;
}, 'ObjectId Validation');
