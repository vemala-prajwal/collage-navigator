const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

const { createHandler } = require('../_lib/handler');
const { requestPhonePasswordReset } = require('../../server/lib/authService');

module.exports = createHandler({
  allowedMethods: ['POST'],
  handler: async (_req, body) => {
    const result = await requestPhonePasswordReset(body);
    return { statusCode: 200, body: result };
  },
});
