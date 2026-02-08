import {
  DecoratorBaseController,
  ApiController,
  Get,
  RequireAuth,
  Public,
  ApiTags,
  ApiSummary,
  ApiDescription,
  Returns,
  Param,
  Query,
  Paginated,
  IApplication,
} from '@digitaldefiance/node-express-suite';
import { ITokenRole, ITokenUser, IUserBase } from '@digitaldefiance/suite-core-lib';
import { Types } from '@digitaldefiance/mongoose-types';
import { Environment } from '../environment';
import { IConstants } from '../interfaces/constants';
import { CoreLanguageCode } from '@digitaldefiance/i18n-lib';

/**
 * CustomApiController - Example decorator-based API controller.
 * 
 * This controller demonstrates the recommended decorator-based approach for
 * building custom Express API endpoints with @digitaldefiance/node-express-suite.
 * 
 * Note: The main user authentication routes (/api/user/*) are provided by the
 * library's ApiRouter which is configured in application.ts. This controller
 * is for adding your own custom API endpoints.
 * 
 * Features demonstrated:
 * - @ApiController for controller registration and OpenAPI metadata
 * - @Get, @Post, @Put, @Delete for HTTP method routing
 * - @RequireAuth and @Public for authentication control
 * - @ApiTags, @ApiSummary, @ApiDescription for OpenAPI documentation
 * - @Returns for response documentation
 * - @Param, @Query for parameter injection
 * - @Paginated for pagination support
 * 
 * To use this controller, mount it on your application's router in application.ts:
 * ```typescript
 * // In your Application class constructor, after creating the LibraryApiRouter:
 * const customController = new CustomApiController(app);
 * apiRouter.router.use('/custom', customController.router);
 * ```
 * 
 * @example
 * ```typescript
 * // Create your own controller by extending DecoratorBaseController
 * @ApiTags('Users')
 * @ApiController('/api/users', { description: 'User management endpoints' })
 * class UserController extends DecoratorBaseController {
 *   constructor(app: IApplication) {
 *     super(app);
 *   }
 * 
 *   @Public()
 *   @ApiSummary('Get user by ID')
 *   @Returns(200, 'User', { description: 'User found' })
 *   @Returns(404, 'ErrorResponse', { description: 'User not found' })
 *   @Get('/:id')
 *   async getUser(@Param('id') id: string) {
 *     // Your implementation here
 *   }
 * }
 * ```
 */
@ApiTags('Custom')
@ApiController('/custom', {
  description: 'Custom API endpoints - add your own routes here',
})
@RequireAuth()
export class CustomApiController<
  TID extends Types.ObjectId | string = Types.ObjectId,
  TDate extends Date = Date,
  TLanguage extends CoreLanguageCode = CoreLanguageCode,
  TAccountStatus extends string = string,
  TUser extends IUserBase<TID, TDate, TLanguage, TAccountStatus> = IUserBase<TID, TDate, TLanguage, TAccountStatus>,
  TTokenRole extends ITokenRole<TID, TDate> = ITokenRole<TID, TDate>,
  TTokenUser extends ITokenUser = ITokenUser,
  TEnvironment extends Environment<TID> = Environment<TID>,
  TConstants extends IConstants = IConstants,
  TApplication extends IApplication<TID> = IApplication<TID>,
> extends DecoratorBaseController<TLanguage, TID> {
  constructor(app: TApplication) {
    super(app);
  }

  /**
   * Health check endpoint.
   * Returns the current server status.
   */
  @Public()
  @ApiSummary('Health check')
  @ApiDescription('Returns the current server health status')
  @Returns(200, 'HealthResponse', { description: 'Server is healthy' })
  @Get('/health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Example paginated list endpoint.
   * Demonstrates pagination with query parameter injection.
   */
  @Public()
  @Paginated({ defaultPageSize: 20, maxPageSize: 100 })
  @ApiSummary('List items')
  @ApiDescription('Returns a paginated list of items')
  @Returns(200, 'ItemList', { description: 'List of items' })
  @Get('/items')
  async listItems(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    // Example implementation - replace with your actual logic
    return {
      items: [],
      total: 0,
      page,
      pageSize: limit,
    };
  }

  /**
   * Example get by ID endpoint.
   * Demonstrates path parameter injection.
   */
  @Public()
  @ApiSummary('Get item by ID')
  @ApiDescription('Returns a single item by its ID')
  @Returns(200, 'Item', { description: 'Item found' })
  @Returns(404, 'ErrorResponse', { description: 'Item not found' })
  @Get('/items/:id')
  async getItem(@Param('id') id: string) {
    // Example implementation - replace with your actual logic
    return {
      id,
      name: 'Example Item',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Example authenticated endpoint.
   * Requires JWT authentication (inherited from class-level @RequireAuth).
   */
  @ApiSummary('Get current user profile')
  @ApiDescription('Returns the authenticated user profile')
  @Returns(200, 'UserProfile', { description: 'User profile' })
  @Returns(401, 'ErrorResponse', { description: 'Unauthorized' })
  @Get('/profile')
  async getProfile() {
    // Access authenticated user via this.req.user
    return {
      message: 'Authenticated endpoint',
      // user: this.req.user,
    };
  }
}
