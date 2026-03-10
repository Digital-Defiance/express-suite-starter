/**
 * BrightDB collection definitions.
 *
 * Unlike the MERN variant which uses Mongoose model factories (connection.model()),
 * BrightDB uses BrightDbCollection instances registered via BrightDbModelRegistry.
 * Collections are initialized during application startup by the BrightDbDatabasePlugin.
 *
 * To add a new collection:
 * 1. Define the document interface in documents/
 * 2. Define the collection schema in schemas/
 * 3. Register it in the getSchemaMap() function in schemas/schema.ts
 */
export { getSchemaMap } from '../schemas/schema';
