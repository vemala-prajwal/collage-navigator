const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

const { createHandler } = require('../_lib/handler');
const { resetPasswordWithToken } = require('../../server/lib/authService');

module.exports = createHandler({
  allowedMethods: ['POST'],
  handler: async (_req, body) => {
    const result = await resetPasswordWithToken(body);
    return { statusCode: 200, body: result };
  },
});
