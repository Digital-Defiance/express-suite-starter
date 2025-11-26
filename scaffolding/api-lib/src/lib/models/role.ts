import { BaseModelName, SchemaCollection, IRoleDocument, RoleSchema } from '@digitaldefiance/node-express-suite';
import { Connection } from '@digitaldefiance/mongoose-types';

export function RoleModel(connection: Connection) {
  return connection.model<IRoleDocument>(
    BaseModelName.Role,
    RoleSchema,
    SchemaCollection.Role,
  );
}

export default RoleModel;
