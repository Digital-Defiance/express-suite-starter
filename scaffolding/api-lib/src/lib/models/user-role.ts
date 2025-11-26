import { SchemaCollection, IUserRoleDocument, UserRoleSchema, BaseModelName } from '@digitaldefiance/node-express-suite';
import { Connection, Model } from '@digitaldefiance/mongoose-types';

export default function UserRoleModel(
  connection: Connection,
): Model<IUserRoleDocument> {
  return connection.model<IUserRoleDocument>(
    BaseModelName.UserRole,
    UserRoleSchema,
    SchemaCollection.UserRole,
  );
}
