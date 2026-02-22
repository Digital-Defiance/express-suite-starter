import { BaseModelName, SchemaCollection, RoleDocument, RoleSchema } from '@digitaldefiance/node-express-suite';
import { Connection } from '@digitaldefiance/mongoose-types';

export function RoleModel(connection: Connection) {
  return connection.model<RoleDocument>(
    BaseModelName.Role,
    RoleSchema,
    SchemaCollection.Role,
  );
}

export default RoleModel;
