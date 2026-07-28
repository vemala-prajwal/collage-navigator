const { createHandler } = require('../_lib/handler');
const { CAMPUSES } = require('../_lib/authService');

module.exports = createHandler({
  allowedMethods: ['GET'],
  handler: async () => ({ statusCode: 200, body: { campuses: CAMPUSES } }),
});
