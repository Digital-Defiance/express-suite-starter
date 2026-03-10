import { Connection, Types } from '@digitaldefiance/mongoose-types';
import { BaseModelName, createEmailTokenSchema, createMnemonicSchema, createRoleSchema, createUsedDirectLoginTokenSchema, createUserRoleSchema, MnemonicSchema, RoleSchema, SchemaCollection, SchemaMap, UsedDirectLoginTokenSchema, UserRoleSchema } from '@digitaldefiance/node-express-suite';
import EmailTokenModel from '../models/email-token';
import MnemonicModel from '../models/mnemonic';
import RoleModel from '../models/role';
import UsedDirectLoginTokenModel from '../models/used-direct-login-token';
import UserModel from '../models/user';
import UserRoleModel from '../models/user-role';
import { UserSchema } from './user';
import { ModelDocMap } from '../shared-types';
import { IConstants } from '../interfaces/constants';
import { Constants } from '../constants';

export function getSchemaMap(connection: Connection, constants: IConstants = Constants): SchemaMap<Types.ObjectId, ModelDocMap> {
  return {
    EmailToken: {
      collection: SchemaCollection.EmailToken,
      model: EmailTokenModel(connection),
      modelName: BaseModelName.EmailToken,
      schema: createEmailTokenSchema(undefined, constants),
    },
    Mnemonic: {
      collection: SchemaCollection.Mnemonic,
      model: MnemonicModel(connection),
      modelName: BaseModelName.Mnemonic,
      schema: createMnemonicSchema(undefined, constants),
    },
    Role: {
      collection: SchemaCollection.Role,
      model: RoleModel(connection),
      modelName: BaseModelName.Role,
      schema: createRoleSchema(undefined, constants),
    },
    UsedDirectLoginToken: {
      collection: SchemaCollection.UsedDirectLoginToken,
      model: UsedDirectLoginTokenModel(connection),
      modelName: BaseModelName.UsedDirectLoginToken,
      schema: createUsedDirectLoginTokenSchema(undefined, constants),
    },
    User: {
      collection: SchemaCollection.User,
      model: UserModel(connection),
      modelName: BaseModelName.User,
      schema: UserSchema,
    },
    UserRole: {
      collection: SchemaCollection.UserRole,
      model: UserRoleModel(connection),
      modelName: BaseModelName.UserRole,
      schema: createUserRoleSchema(undefined, constants),
    },
  };
}
