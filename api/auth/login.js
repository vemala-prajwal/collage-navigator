const path = require('path');
const dotenv = require('dotenv');
const { createHandler } = require('../_lib/handler');
const { loginAccount } = require('../../server/lib/authService');

dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

module.exports = createHandler({
  allowedMethods: ['POST'],
  handler: async (_req, body) => {
    const result = await loginAccount(body);
    return { statusCode: 200, body: result };
  },
});
