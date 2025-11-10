import { IECIESConfig, ECIES } from '@digitaldefiance/ecies-lib';

export const config: IECIESConfig = {
  curveName: ECIES.CURVE_NAME,
  primaryKeyDerivationPath: ECIES.PRIMARY_KEY_DERIVATION_PATH,
  mnemonicStrength: ECIES.MNEMONIC_STRENGTH,
  symmetricAlgorithm: ECIES.SYMMETRIC_ALGORITHM_CONFIGURATION,
  symmetricKeyBits: ECIES.SYMMETRIC.KEY_BITS,
  symmetricKeyMode: ECIES.SYMMETRIC.MODE,
};
