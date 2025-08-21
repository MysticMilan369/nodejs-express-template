import swaggerJSDoc from 'swagger-jsdoc';
import { config } from '@/config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'User Management API',
    version: '1.0.0',
    description: `API documentation for the User Management system.<br>
  <a href="/swagger/resource/swagger.json" download="User_Management_API_Swagger.json" style="font-weight:bold;color:#2196f3;">Download Swagger JSON</a>
  <br>Created by Mystic Milan <a href="https://github.com/mysticmilan369" target="_blank" style="font-weight:bold;color:#2196f3;">GitHub</a>`,
  },
  servers: [
    {
      url: `http://${config.server.host}:${config.server.port}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: ['src/routes/*.ts', 'src/controllers/*.ts', 'src/models/*.ts', 'src/validators/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
