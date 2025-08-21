import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';

import { Express } from 'express';

export function swaggerSetup(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
