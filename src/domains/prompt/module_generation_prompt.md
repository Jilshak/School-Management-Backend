# Module Generation Prompt

Use this prompt to generate new modules with similar functionality to the Students module in our NestJS application, including Swagger UI integration, error validations, and Winston logging.

## Module Structure

1. Create a new directory for your module in the `src` folder (e.g., `src/new-module`).
2. Inside this directory, create the following files:
   - `new-module.module.ts`
   - `new-module.controller.ts`
   - `new-module.service.ts`
   - `dto/create-new-module.dto.ts`
   - `dto/update-new-module.dto.ts`

## Schema

1. In `src/domains/schema`, create a new schema file (e.g., `new-module.schema.ts`).
2. Define the schema using `@Prop()` decorators from `@nestjs/mongoose`.
3. Use `@ApiProperty()` decorators for Swagger documentation of schema properties.
4. Export both the class and the schema.

## DTO (Data Transfer Object)

1. In the `dto` folder, create DTOs for creating and updating entities.
2. Use class-validator decorators for validation (e.g., `@IsString()`, `@IsNumber()`, `@IsEnum()`).
3. Use `@ApiProperty()` decorator from `@nestjs/swagger` for Swagger documentation, including example values.
4. Implement nested DTOs if necessary, using `@ValidateNested()` and `@Type()` decorators.

## Controller

1. Use `@Controller()` decorator to define the route.
2. Implement CRUD operations: CREATE, READ, UPDATE, DELETE, and PATCH.
3. Use Swagger decorators for comprehensive API documentation:
   - `@ApiTags()` for grouping endpoints
   - `@ApiOperation()` for describing each endpoint
   - `@ApiResponse()` for documenting possible responses
   - `@ApiBody()` for describing request body
   - `@ApiParam()` for documenting path parameters
   - `@ApiBearerAuth()` if using JWT authentication
4. Implement role-based access control using `@Roles()` decorator.
5. Use `@UseGuards()` for applying authentication and authorization guards.

## Service

1. Inject the model using `@InjectModel()`.
2. Implement methods for each CRUD operation.
3. Use transactions where appropriate, checking if the database supports transactions.
4. Handle errors and throw appropriate exceptions:
   - `NotFoundException` for not found resources
   - `BadRequestException` for invalid input
   - `InternalServerErrorException` for unexpected errors
5. Implement proper error messages and logging using Winston.

## Module

1. Import `MongooseModule.forFeature()` with the schema.
2. Include the controller and service in the `@Module()` decorator.
3. Import any necessary guards or shared modules.

## Error Handling and Validation

1. Implement a global exception filter to standardize error responses.
2. Use class-validator for DTO validation.
3. Implement custom validators if needed.
4. Use pipes for parameter validation and transformation.

## Swagger Integration

1. In `main.ts`, set up Swagger using `SwaggerModule.setup()`.
2. Use `@ApiTags()` to group related endpoints.
3. Provide detailed descriptions and examples in `@ApiProperty()` decorators.
4. Document possible error responses using `@ApiResponse()`.

## Winston Logging

1. Import the Winston logger in your service file:
   ```typescript
   import { Logger } from 'winston';
   ```
2. Inject the Winston logger into your service:
   ```typescript
   constructor(
     @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
     // ... other injections
   ) {}
   ```
3. Use the logger in your service methods:
   ```typescript
   this.logger.info('Method called', { context: 'YourService', methodName: 'methodName' });
   this.logger.error('An error occurred', { context: 'YourService', methodName: 'methodName', error });
   ```
4. Log important events, method calls, and errors throughout your service.

## Example Implementation

Here's a basic structure for each file:

### new-module.module.ts