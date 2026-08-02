const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

const { createHandler } = require('../_lib/handler');
const { getCurrentUser } = require('../../server/lib/authService');

module.exports = createHandler({
  allowedMethods: ['GET'],
  handler: async (req) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const user = await getCurrentUser(token);

    return {
      statusCode: 200,
      body: { user },
    };
  },
});
