import { BaseModelName, SchemaCollection, EmailTokenDocument, EmailTokenSchema } from '@digitaldefiance/node-express-suite';
import { Connection } from '@digitaldefiance/mongoose-types';

export function EmailTokenModel(connection: Connection) {
  return connection.model<EmailTokenDocument>(
    BaseModelName.EmailToken,
    EmailTokenSchema,
    SchemaCollection.EmailToken,
  );
}

export default EmailTokenModel;
