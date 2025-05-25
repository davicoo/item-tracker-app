exports.handler = async (event, context) => {
  const crypto = require('crypto');
  
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY; // Set this in Netlify env vars
  const token = event.queryStringParameters.token || '';
  const expire = event.queryStringParameters.expire || '';
  
  const authString = token + expire;
  const signature = crypto.createHmac('sha1', privateKey).update(authString).digest('hex');
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({
      token: token,
      expire: expire,
      signature: signature
    })
  };
};

