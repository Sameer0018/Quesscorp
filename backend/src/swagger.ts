import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const spec = {
  openapi: '3.0.0',
  info: { title: 'HRMS Lite API', version: '1.0.0', description: 'Employee and Attendance API with JWT auth' },
  servers: [{ url: '/api', description: 'API base' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Employee: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' }, full_name: { type: 'string' }, email: { type: 'string' }, department: { type: 'string' } },
      },
      Attendance: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' }, employee_id: { type: 'string' }, date: { type: 'string', format: 'date' }, status: { type: 'string', enum: ['Present', 'Absent'] } },
      },
      Error: { type: 'object', properties: { error: { type: 'string' }, details: { type: 'array', items: { type: 'string' } } } },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { 200: { description: 'Token and user' }, 400: { description: 'Validation failed' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register (optional)',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation failed' }, 409: { description: 'Email exists' } },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/employees': {
      get: {
        summary: 'List employees',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of employees' } },
      },
      post: {
        summary: 'Create employee',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['full_name', 'email', 'department'], properties: { full_name: { type: 'string' }, email: { type: 'string' }, department: { type: 'string' } } } } } },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation failed' }, 409: { description: 'Email exists' } },
      },
    },
    '/employees/{id}': {
      get: {
        summary: 'Get employee',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Employee' }, 404: { description: 'Not found' } },
      },
      put: {
        summary: 'Update employee',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { full_name: { type: 'string' }, email: { type: 'string' }, department: { type: 'string' } } } } } },
        responses: { 200: { description: 'Updated' }, 400: { description: 'Validation failed' }, 404: { description: 'Not found' }, 409: { description: 'Email exists' } },
      },
      delete: {
        summary: 'Delete employee',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/attendance': {
      post: {
        summary: 'Mark attendance',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['employee_id', 'date', 'status'], properties: { employee_id: { type: 'string' }, date: { type: 'string', format: 'date' }, status: { type: 'string', enum: ['Present', 'Absent'] } } } } } },
        responses: { 201: { description: 'Created' }, 200: { description: 'Updated existing' }, 400: { description: 'Validation failed' }, 404: { description: 'Employee not found' } },
      },
    },
    '/attendance/{employee_id}': {
      get: {
        summary: 'Get attendance for employee',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'employee_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'List of attendance' }, 404: { description: 'Employee not found' } },
      },
    },
  },
};

export function setupSwagger(app: Express, basePath: string): void {
  app.use(`${basePath}/api-docs`, swaggerUi.serve, swaggerUi.setup(spec));
}
