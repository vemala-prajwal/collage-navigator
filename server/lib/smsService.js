<<<<<<< HEAD
const https = require('https');

/**
 * Flexible SMS Service supporting Twilio, MSG91, or console log fallback in dev.
 */
const sendSms = async ({ to, message }) => {
  const normalizedPhone = String(to).replace(/\s+/g, '');

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  const msg91Key = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;

  // 1. Try Twilio if configured
  if (twilioSid && twilioToken && twilioPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const postData = new URLSearchParams({
        To: normalizedPhone,
        From: twilioPhone,
        Body: message,
      }).toString();

      return await new Promise((resolve, reject) => {
        const req = https.request(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(postData),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                console.info(`[SMS SERVICE] Twilio SMS sent successfully to ${normalizedPhone}`);
                resolve({ success: true, provider: 'twilio' });
              } else {
                console.error(`[SMS SERVICE] Twilio error (${res.statusCode}):`, data);
                reject(new Error(`Twilio SMS failed with status ${res.statusCode}`));
              }
            });
          }
        );

        req.on('error', (err) => reject(err));
        req.write(postData);
        req.end();
      });
    } catch (err) {
      console.error('[SMS SERVICE] Failed to send via Twilio:', err.message);
      // Fall through to fallback log
    }
  }

  // 2. Try MSG91 if configured
  if (msg91Key && msg91TemplateId) {
    try {
      const postData = JSON.stringify({
        template_id: msg91TemplateId,
        short_url: '0',
        recipients: [{ mobiles: normalizedPhone.replace(/^\+/, ''), message }],
      });

      return await new Promise((resolve, reject) => {
        const req = https.request('https://control.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: {
            authkey: msg91Key,
            'content-type': 'application/json',
          },
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.info(`[SMS SERVICE] MSG91 SMS sent to ${normalizedPhone}`);
              resolve({ success: true, provider: 'msg91' });
            } else {
              console.error(`[SMS SERVICE] MSG91 error (${res.statusCode}):`, data);
              reject(new Error(`MSG91 SMS failed with status ${res.statusCode}`));
            }
          });
        });

        req.on('error', (err) => reject(err));
        req.write(postData);
        req.end();
      });
    } catch (err) {
      console.error('[SMS SERVICE] Failed to send via MSG91:', err.message);
    }
  }

  // 3. Fallback for Dev mode / unconfigured SMS providers
  console.info('=====================================================');
  console.info(`[SMS SERVICE] [DEV FALLBACK]`);
  console.info(`To: ${normalizedPhone}`);
  console.info(`Message: ${message}`);
  console.info('=====================================================');

  return { success: true, provider: 'console_dev_fallback' };
=======
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
>>>>>>> prajwal
};

module.exports = { sendSms };
