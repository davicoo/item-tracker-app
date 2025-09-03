const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

const baseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: baseHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { email, name, signupUrl } = JSON.parse(event.body || '{}');

    if (!email || !signupUrl) {
      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const region = process.env.AWS_REGION || process.env.SES_REGION;
    const from = process.env.MAIL_FROM;
    const template = process.env.SES_TEMPLATE_INVITE || 'store-invite';

    if (!region || !from) {
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing mail server configuration' }),
      };
    }

    const ses = new SESv2Client({ region });

    const command = new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [email] },
      Content: {
        Template: {
          TemplateName: template,
          TemplateData: JSON.stringify({ name: name || '', signupUrl }),
        },
      },
    });

    await ses.send(command);

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Error sending invite:', err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ ok: false, error: err.name || 'INVITE_FAILED', detail: err.message }),
    };
  }
};
