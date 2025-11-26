import { BaseModelName, SchemaCollection, IEmailTokenDocument, EmailTokenSchema } from '@digitaldefiance/node-express-suite';
import { Connection } from '@digitaldefiance/mongoose-types';

export function EmailTokenModel(connection: Connection) {
  return connection.model<IEmailTokenDocument>(
    BaseModelName.EmailToken,
    EmailTokenSchema,
    SchemaCollection.EmailToken,
  );
}

export default EmailTokenModel;
