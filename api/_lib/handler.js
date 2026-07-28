const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const applyCors = (req, res) => {
  const origin = process.env.CLIENT_URL || req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });

const createHandler = ({ allowedMethods, handler }) => async (req, res) => {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!allowedMethods.includes(req.method)) {
    sendJson(res, 405, { message: 'Method not allowed' });
    return;
  }

  try {
    const body = req.method === 'GET' ? {} : await readJsonBody(req);
    const result = await handler(req, body);
    sendJson(res, result.statusCode || 200, result.body);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, {
      message: error.message || 'Server error',
    });
  }
};

module.exports = { createHandler, sendJson };
