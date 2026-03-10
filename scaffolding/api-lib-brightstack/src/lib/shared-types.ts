import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationChain } from 'express-validator';
import { Brand } from 'ts-brand';
import type { IUserDocument } from './documents/user';
import { CoreLanguageCode } from '@digitaldefiance/i18n-lib';
import { IKeyPairBufferWithUnEncryptedPrivateKey, ISigningKeyPrivateKeyInfo, ISimplePublicKeyOnly, ISimpleKeyPairBuffer, ISimplePublicKeyOnlyBuffer, PlatformID } from '@digitaldefiance/node-ecies-lib';
import { IApiErrorResponse, IApiMessageResponse, IStatusCodeResponse, IApiExpressValidationErrorResponse } from '@digitaldefiance/node-express-suite';
import {
  DefaultBackendIdType,
  IBlockStorageSchema,
  IBlockStorageModel,
  IBlockStorageSchemaEntry,
  SchemaMap as BrightDbSchemaMap,
  BrightDbCollection,
} from '@brightchain/node-express-suite';

export type { DefaultBackendIdType } from '@brightchain/node-express-suite';

/**
 * Validated body for express-validator
 */
export type ValidatedBody<T extends string> = {
  [K in T]: unknown;
};

/**
 * Schema map type for BrightDB collections.
 * Maps model names to their BrightDB schema entries.
 */
export type SchemaMap = BrightDbSchemaMap;

export type ApiRequestHandler<T extends ApiResponse> = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<IStatusCodeResponse<T>>;

export type TypedHandlers = {
  [key: string]: ApiRequestHandler<ApiResponse>;
};

export interface IRouteDefinition<T extends TypedHandlers> {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  options: {
    handlerKey: keyof T;
    validation?: (validationLanguage: CoreLanguageCode) => ValidationChain[];
    useAuthentication: boolean;
    useCryptoAuthentication: boolean;
  };
}

export type RouteHandlers = Record<string, ApiRequestHandler<ApiResponse>>;

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface RouteConfig<H extends object> {
  method: HttpMethod;
  path: string;
  handlerKey: keyof H;
  handlerArgs?: Array<unknown>;
  useAuthentication: boolean;
  useCryptoAuthentication: boolean;
  middleware?: RequestHandler[];
  validation?: FlexibleValidationChain;
  rawJsonHandler?: boolean;
  authFailureStatusCode?: number;
}

export function routeConfig<T extends object>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  path: string,
  options: {
    handlerKey: keyof T;
    validation?: (validationLanguage: CoreLanguageCode) => ValidationChain[];
    useAuthentication: boolean;
    useCryptoAuthentication: boolean;
  },
): RouteConfig<T> {
  return {
    method,
    path,
    handlerKey: options.handlerKey,
    validation: options.validation,
    useAuthentication: options.useAuthentication,
    useCryptoAuthentication: options.useCryptoAuthentication,
  };
}

export type THandlerArgs<T extends Array<unknown>> = T;

export type FlexibleValidationChain =
  | ValidationChain[]
  | ((lang: CoreLanguageCode) => ValidationChain[]);

export type JsonPrimitive = string | number | boolean | null | undefined;

export type JsonResponse =
  | JsonPrimitive
  | { [key: string]: JsonResponse }
  | JsonResponse[];

export type ApiErrorResponse =
  | IApiErrorResponse
  | IApiExpressValidationErrorResponse;

export type ApiResponse = IApiMessageResponse | ApiErrorResponse | JsonResponse;

export type SendFunction<T extends ApiResponse> = (
  statusCode: number,
  data: T,
  res: Response<T>,
) => void;

export type KeyPairBufferWithUnEncryptedPrivateKey = Brand<
  IKeyPairBufferWithUnEncryptedPrivateKey,
  'KeyPairBufferWithUnEncryptedPrivateKey'
>;
export type SigningKeyPrivateKeyInfo = Brand<
  ISigningKeyPrivateKeyInfo,
  'SigningKeyPrivateKeyInfo'
>;
export type SimpleKeyPair = Brand<SimplePublicKeyOnly, 'SimpleKeyPair'>;
export type SimplePublicKeyOnly = Brand<
  ISimplePublicKeyOnly,
  'SimplePublicKeyOnly'
>;
export type SimpleKeyPairBuffer = Brand<
  ISimpleKeyPairBuffer,
  'SimpleKeyPairBuffer'
>;
export type SimplePublicKeyOnlyBuffer = Brand<
  ISimplePublicKeyOnlyBuffer,
  'SimplePublicKeyOnlyBuffer'
>;
export type HexString = Brand<string, 'HexString'>;
export type SignatureString = Brand<HexString, 'SignatureString'>;
export type SignatureBuffer = Buffer & Brand<Buffer, 'SignatureBuffer'>;
export type ChecksumBuffer = Buffer &
  Brand<Buffer, 'Sha3Checksum', 'ChecksumBuffer'>;
export type ChecksumString = Brand<HexString, 'Sha3Checksum', 'ChecksumString'>;

/**
 * Extended Buffer type for data
 */
export type DataBuffer = Buffer & {
  toBuffer(): Buffer;
  toHex(): string;
};
