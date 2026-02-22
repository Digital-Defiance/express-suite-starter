import { BaseModelName, UsedDirectLoginTokenDocument, SchemaCollection,UsedDirectLoginTokenSchema } from '@digitaldefiance/node-express-suite';
import { Connection, Model } from '@digitaldefiance/mongoose-types';

export default function UsedDirectLoginTokenModel(
  connection: Connection,
): Model<UsedDirectLoginTokenDocument> {
  return connection.model<UsedDirectLoginTokenDocument>(
    BaseModelName.UsedDirectLoginToken,
    UsedDirectLoginTokenSchema,
    SchemaCollection.UsedDirectLoginToken,
  );
}
