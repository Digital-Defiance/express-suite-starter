import { SchemaCollection, UserRoleDocument, UserRoleSchema, BaseModelName } from '@digitaldefiance/node-express-suite';
import { Connection, Model } from '@digitaldefiance/mongoose-types';

export default function UserRoleModel(
  connection: Connection,
): Model<UserRoleDocument> {
  return connection.model<UserRoleDocument>(
    BaseModelName.UserRole,
    UserRoleSchema,
    SchemaCollection.UserRole,
  );
}
