import { IBlockStorageSchema } from '@brightchain/node-express-suite';
import { IUserDocument } from '../documents';

/**
 * BrightDB schema definition for User documents.
 *
 * Unlike the MERN variant which uses Mongoose Schema with validators and hooks,
 * BrightDB schemas are declarative field definitions used by the block storage layer.
 */
export const UserSchema: IBlockStorageSchema<IUserDocument> = {
  name: 'User',
  fields: {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    passwordHash: { type: 'string', required: true },
    language: { type: 'string', required: true },
    accountStatus: { type: 'string', required: true },
    roles: { type: 'array', required: false },
    createdAt: { type: 'date', required: false },
    updatedAt: { type: 'date', required: false },
  },
  indexes: [
    { fields: { email: 1 }, options: { unique: true } },
    { fields: { name: 1 } },
  ],
};
