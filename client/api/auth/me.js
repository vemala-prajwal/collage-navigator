const { createHandler } = require('../_lib/handler');
const { getCurrentUser } = require('../_lib/authService');

module.exports = createHandler({
  allowedMethods: ['GET'],
  handler: async (req) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    return { statusCode: 200, body: { user: await getCurrentUser(token) } };
  },
});
