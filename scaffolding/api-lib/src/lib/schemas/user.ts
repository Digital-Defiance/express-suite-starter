import { createUserSchema, IConstants } from '@digitaldefiance/node-express-suite';
import { Constants } from '../constants';
import { Schema } from 'mongoose';
import { IUserDocument } from '../documents';

// Clone base schema and extend
const BaseUserSchema = createUserSchema<IConstants>(undefined, undefined, undefined, undefined, Constants);
export const UserSchema: Schema<IUserDocument> = BaseUserSchema.clone();

// // Add site-specific fields
// UserSchema.add(
//   {
// });
