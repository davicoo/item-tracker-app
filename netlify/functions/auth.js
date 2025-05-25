const ImageKit = require('imagekit');

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
    const imagekit = new ImageKit({
      publicKey: "public_8RxT918PPFr+aU5aqwgMZx/waIU=",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: "https://ik.imagekit.io/mydwcapp"
    });

    // Use ImageKit's built-in method to generate auth parameters
    const { token, expire, signature } = imagekit.getAuthenticationParameters();
    
    // IMPORTANT: Also return the publicKey as shown in ImageKit docs
    const response = {
      token,
      expire,
      signature,
      publicKey: "public_8RxT918PPFr+aU5aqwgMZx/waIU=" // Add this!
    };
    
    console.log('ImageKit SDK generated params:', response);
    
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
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};

