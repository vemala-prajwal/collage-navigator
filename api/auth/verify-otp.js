const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const altCandidates = [
    path.resolve(__dirname, '../../server/.env'),
    path.resolve(__dirname, '../../client/.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'client/.env'),
  ];
  for (const candidate of altCandidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      break;
    }
  }
}

const { createHandler } = require('../_lib/handler');
const { verifyPhonePasswordResetOtp } = require('../../server/lib/authService');

module.exports = createHandler({
  allowedMethods: ['POST'],
  handler: async (_req, body) => {
    const result = await verifyPhonePasswordResetOtp(body);
    return { statusCode: 200, body: result };
  },
});
