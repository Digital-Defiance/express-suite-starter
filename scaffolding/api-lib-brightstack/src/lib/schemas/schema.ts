import {
  IBlockStorageSchemaEntry,
  SchemaMap,
} from '@brightchain/node-express-suite';
import { UserSchema } from './user';
import { IConstants } from '../interfaces/constants';
import { Constants } from '../constants';

/**
 * Returns the BrightDB schema map for all collections.
 *
 * Unlike the MERN variant which creates Mongoose models via connection.model(),
 * BrightDB uses declarative schema entries that describe the collection structure.
 * The BrightDbDatabasePlugin uses this map to initialize collections.
 */
export function getSchemaMap(constants: IConstants = Constants): SchemaMap {
  return {
    User: {
      collection: 'users',
      model: {
        modelName: 'User',
        schema: UserSchema,
      },
      modelName: 'User',
      schema: UserSchema,
    },
  };
}
