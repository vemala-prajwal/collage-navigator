const { createHandler } = require('../_lib/handler');
const { loginAccount } = require('../_lib/authService');

module.exports = createHandler({
  allowedMethods: ['POST'],
  handler: async (_req, body) => ({ statusCode: 200, body: await loginAccount(body) }),
});
