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
      console.error('IMAGEKIT_PRIVATE_KEY not found in environment variables');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Private key not configured' })
      };
    }

    // ImageKit sends token and expire as query parameters
    const token = event.queryStringParameters?.token || '';
    const expire = event.queryStringParameters?.expire || '';
    
    console.log('Auth request received:', { token, expire });

    if (!token || !expire) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Token and expire parameters required' })
      };
    }

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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

