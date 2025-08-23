const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { subject, body } = JSON.parse(event.body || '{}');
    const client = new SESClient({ region: process.env.AWS_REGION });
    const params = {
      Destination: { ToAddresses: ['info@uglystuff.ca'] },
      Message: {
        Body: { Text: { Data: body || '' } },
        Subject: { Data: subject || 'Message' },
      },
      Source: 'postmaster@dwcstuff.ca',
    };
    await client.send(new SendEmailCommand(params));
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Error sending email:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to send email' }) };
  }
};
