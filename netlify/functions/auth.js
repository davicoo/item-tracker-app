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

    // Generate proper authentication parameters
    const token = crypto.randomBytes(20).toString('hex');
    
    // CRITICAL FIX: expire must be Unix timestamp in seconds, max 1 hour from now
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const expire = currentTimeInSeconds + 3600; // Add 1 hour (3600 seconds)
    
    console.log('Current time (seconds):', currentTimeInSeconds);
    console.log('Expire time (seconds):', expire);
    console.log('Time until expire (minutes):', (expire - currentTimeInSeconds) / 60);
    
    const authString = token + expire;
    const signature = crypto.createHmac('sha1', privateKey).update(authString).digest('hex');
    
    const response = {
      token: token,
      expire: expire,
      signature: signature
    };
    
    console.log('Auth response:', response);
    
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

