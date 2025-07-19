const fs = require('fs');
const path = require('path');

// Path to our data file
const DATA_FILE = path.join('/tmp', 'items-data.json');


exports.handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only handle GET requests
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    // Check if the file exists
    if (fs.existsSync(DATA_FILE)) {
      // Read the items from the file
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return {
        statusCode: 200,
        headers,
        body: data
      };
    } else {
        // Return empty array if file doesn't exist
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
    }
  } catch (error) {
    console.error('Error getting items:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get items' })
    };
  }
};
