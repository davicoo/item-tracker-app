const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

// CORS headers for browser calls
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
    const { subject = 'Message', html, text, replyTo } = JSON.parse(event.body || '{}');

    if (!subject || (!html && !text)) {
      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing subject/body' }),
      };
    }

    const region = process.env.AWS_REGION || process.env.SES_REGION;
    const from = process.env.MAIL_FROM;
    const to = process.env.MAIL_TO;

    if (!region || !from || !to) {
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing mail server configuration' }),
      };
    }

    const ses = new SESv2Client({ region });
    const command = new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: {
            Html: html ? { Data: html } : undefined,
            Text: { Data: (text ?? html)?.replace(/<[^>]+>/g, ' ') },
          },
        },
      },
    });

    const info = await ses.send(command);

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ ok: true, messageId: info.$metadata?.requestId }),
    };
  } catch (err) {
    console.error('Error sending email:', err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ ok: false, error: err.name || 'EMAIL_SEND_FAILED', detail: err.message }),
    };
  }
};
