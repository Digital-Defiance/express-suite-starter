import { BaseModelName, SchemaCollection, MnemonicDocument, MnemonicSchema } from '@digitaldefiance/node-express-suite';
import { Connection } from '@digitaldefiance/mongoose-types';

export function MnemonicModel(connection: Connection) {
  return connection.model<MnemonicDocument>(
    BaseModelName.Mnemonic,
    MnemonicSchema,
    SchemaCollection.Mnemonic,
  );
}

export default MnemonicModel;
