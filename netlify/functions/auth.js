exports.handler = async (event, context) => {
  // Add CORS headers for preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: ''
    };
  }

  try {
    const crypto = require('crypto');
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    
    if (!privateKey) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Private key not configured' })
      };
    }

    // Generate authentication parameters according to ImageKit docs
    const token = crypto.randomBytes(20).toString('hex');
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const expire = currentTimeInSeconds + 3600; // 1 hour from now
    
    // CRITICAL FIX: ImageKit expects signature = HMAC-SHA1(token + expire)
    // The authString should be: token + expire (as strings concatenated)
    const authString = token + expire.toString();
    const signature = crypto.createHmac('sha1', privateKey).update(authString).digest('hex');
    
    console.log('Token:', token);
    console.log('Expire:', expire);
    console.log('Auth string (token + expire):', authString);
    console.log('Private key length:', privateKey.length);
    console.log('Generated signature:', signature);
    
    const response = {
      token: token,
      expire: expire,
      signature: signature
    };
    
    console.log('Final auth response:', response);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

