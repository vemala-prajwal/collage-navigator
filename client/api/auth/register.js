const { createHandler } = require('../_lib/handler');
const { registerAccount } = require('../_lib/authService');

module.exports = createHandler({
  allowedMethods: ['POST'],
  handler: async (_req, body) => ({ statusCode: 201, body: await registerAccount(body) }),
});
