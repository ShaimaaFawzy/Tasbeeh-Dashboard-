/**
 * Swagger/OpenAPI Reusable Schema Components
 *
 * Defines common schemas that can be referenced throughout the API documentation.
 * Use $ref to reference these schemas in JSDoc comments.
 *
 * Example usage in JSDoc:
 * @swagger
 * components:
 *   schemas:
 *     $ref: '#/components/schemas/UserResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *           description: Indicates if the request was successful
 *         message:
 *           type: string
 *           example: Operation completed successfully
 *           description: Human-readable success message
 *         data:
 *           type: object
 *           description: Response payload (varies by endpoint)
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *           description: Always false for error responses
 *         message:
 *           type: string
 *           example: An error occurred
 *           description: Human-readable error message
 *         errorCode:
 *           type: string
 *           example: INTERNAL_ERROR
 *           description: Machine-readable error code
 *         errors:
 *           type: array
 *           description: Detailed validation errors (if applicable)
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: email
 *               message:
 *                 type: string
 *                 example: Invalid email format
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *           description: Unique user identifier
 *         name:
 *           type: string
 *           example: John Doe
 *           description: User's full name
 *         userName:
 *           type: string
 *           example: johndoe
 *           description: Unique username
 *           nullable: true
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *           description: User's email address
 *           nullable: true
 *         userType:
 *           type: string
 *           enum: [Admin, Normal]
 *           example: Normal
 *           description: User role/type
 *         country:
 *           type: string
 *           example: United States
 *           description: User's country
 *           nullable: true
 *         city:
 *           type: string
 *           example: New York
 *           description: User's city
 *           nullable: true
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - userName
 *         - email
 *         - mobile
 *         - password
 *         - country
 *         - city
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *           example: John Doe
 *           description: User's full name
 *         userName:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           pattern: '^[a-zA-Z0-9]+$'
 *           example: johndoe
 *           description: Unique username (alphanumeric only)
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 250
 *           example: john.doe@example.com
 *           description: User's email address
 *         mobile:
 *           type: string
 *           pattern: '^\+?[1-9]\d{1,14}$'
 *           maxLength: 20
 *           example: '+1234567890'
 *           description: Mobile number in international format
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$'
 *           example: SecurePass123
 *           description: Password (must contain uppercase, lowercase, and number)
 *         country:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: United States
 *           description: User's country
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: New York
 *           description: User's city
 *         userType:
 *           type: string
 *           enum: [Admin, Normal]
 *           default: Normal
 *           example: Normal
 *           description: User role/type
 *
 *     RegisterResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/UserResponse'
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - identifier
 *         - password
 *       properties:
 *         identifier:
 *           type: string
 *           example: johndoe
 *           description: Email address or username
 *         password:
 *           type: string
 *           format: password
 *           example: SecurePass123
 *           description: User's password
 *
 *     TokenResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *           description: JWT authentication token
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: 123e4567-e89b-12d3-a456-426614174000
 *             name:
 *               type: string
 *               example: John Doe
 *             email:
 *               type: string
 *               format: email
 *               example: john.doe@example.com
 *               nullable: true
 *             userName:
 *               type: string
 *               example: johndoe
 *               nullable: true
 *             userType:
 *               type: string
 *               enum: [Admin, Normal]
 *               example: Normal
 *
 *     LoginResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/TokenResponse'
 *
 *     DeviceResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *           description: Unique device identifier
 *         deviceId:
 *           type: string
 *           maxLength: 50
 *           example: DEVICE-ABC-123
 *           description: Device hardware identifier
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *           description: ID of user who owns this device
 *         paringDate:
 *           type: string
 *           format: date-time
 *           example: 2025-11-02T10:30:00Z
 *           description: When device was paired with user account
 *         usageCount:
 *           type: integer
 *           example: 150
 *           description: Number of times device has been used
 *         deviceStatus:
 *           type: boolean
 *           example: true
 *           description: Whether device is active
 *         lastSync:
 *           type: string
 *           format: date-time
 *           example: 2025-11-02T10:30:00Z
 *           description: Last time device synced with server
 *
 *     CreateDeviceRequest:
 *       type: object
 *       required:
 *         - deviceId
 *         - userId
 *       properties:
 *         deviceId:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: DEVICE-ABC-123
 *           description: Unique device hardware identifier
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *           description: ID of user to pair with device
 *         deviceStatus:
 *           type: boolean
 *           default: true
 *           example: true
 *           description: Initial device status
 *
 *     UpdateDeviceRequest:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         deviceId:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           example: DEVICE-XYZ-456
 *           description: New device hardware identifier
 *         deviceStatus:
 *           type: boolean
 *           example: false
 *           description: Updated device status
 *         usageCount:
 *           type: integer
 *           minimum: 0
 *           example: 200
 *           description: Updated usage count
 *
 *     DeviceSuccessResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/DeviceResponse'
 *
 *     DeviceListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeviceResponse'
 *
 *     PaginatedDeviceResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 devices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeviceResponse'
 *                 total:
 *                   type: integer
 *                   example: 100
 *                   description: Total number of devices
 *                 page:
 *                   type: integer
 *                   example: 1
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                   description: Items per page
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                   description: Total number of pages
 *
 *     ValidationErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             errorCode:
 *               type: string
 *               example: VALIDATION_ERROR
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     example: email
 *                   message:
 *                     type: string
 *                     example: Invalid email format
 */

// This file only contains JSDoc comments for schema definitions
// No executable code is needed
export {};
