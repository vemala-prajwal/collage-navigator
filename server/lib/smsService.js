/**
 * smsService.js
 *
 * Abstracted SMS sending service with support for:
 *  - Twilio (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER)
 *  - MSG91  (MSG91_AUTH_KEY + MSG91_TEMPLATE_ID)
 *  - Dev Fallback: logs OTP to console when no SMS provider is configured
 */

const sendViaTwilio = async ({ to, message }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const body = new URLSearchParams({ To: to, From: from, Body: message }).toString();

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Twilio error: ${err.message || response.statusText}`);
  }
};

const sendViaMSG91 = async ({ to, message }) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  // Strip + prefix for MSG91
  const mobile = to.replace(/^\+/, '');

  const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      authkey: authKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: templateId,
      short_url: '0',
      mobiles: mobile,
      message,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`MSG91 error: ${err.message || response.statusText}`);
  }
};

const sendViaDevFallback = ({ to, message }) => {
  console.log('\n=====================================================');
  console.log('[SMS SERVICE] [DEV FALLBACK] — No SMS provider configured');
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log('=====================================================\n');
};

/**
 * Send an SMS message.
 * @param {{ to: string, message: string }} options
 */
const sendSms = async ({ to, message }) => {
  const hasTwilio =
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER;

  const hasMSG91 = process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID;

  if (hasTwilio) {
    return sendViaTwilio({ to, message });
  }

  if (hasMSG91) {
    return sendViaMSG91({ to, message });
  }

  // No provider configured — use dev console fallback
  sendViaDevFallback({ to, message });
};

module.exports = { sendSms };
