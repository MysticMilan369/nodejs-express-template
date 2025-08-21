import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';

import { Application } from 'express';

export function swaggerSetup(app: Application) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
