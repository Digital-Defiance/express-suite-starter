import { BaseModelName, IUsedDirectLoginTokenDocument, SchemaCollection,UsedDirectLoginTokenSchema } from '@digitaldefiance/node-express-suite';
import { Connection, Model } from '@digitaldefiance/mongoose-types';

export default function UsedDirectLoginTokenModel(
  connection: Connection,
): Model<IUsedDirectLoginTokenDocument> {
  return connection.model<IUsedDirectLoginTokenDocument>(
    BaseModelName.UsedDirectLoginToken,
    UsedDirectLoginTokenSchema,
    SchemaCollection.UsedDirectLoginToken,
  );
}
