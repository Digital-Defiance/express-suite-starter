import { BaseModelName, SchemaCollection, IMnemonicDocument, MnemonicSchema } from '@digitaldefiance/node-express-suite';
import { Connection } from 'mongoose';

export function MnemonicModel(connection: Connection) {
  return connection.model<IMnemonicDocument>(
    BaseModelName.Mnemonic,
    MnemonicSchema,
    SchemaCollection.Mnemonic,
  );
}

export default MnemonicModel;
