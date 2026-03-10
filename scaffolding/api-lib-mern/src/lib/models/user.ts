import { Connection } from '@digitaldefiance/mongoose-types';
import { IUserDocument } from '../documents/user';
import { UserSchema } from '../schemas/user';
import { BaseModelName, SchemaCollection } from '@digitaldefiance/node-express-suite';

export function UserModel(connection: Connection) {
  return connection.model<IUserDocument>(
    BaseModelName.User,
    UserSchema,
    SchemaCollection.User,
  );
}

export default UserModel;
