const nodemailer = require('nodemailer');

// CORS headers for browser calls
const baseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Mail-Token',
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

    if (process.env.MAIL_TOKEN) {
      const incoming = event.headers['x-mail-token'] || event.headers['X-Mail-Token'];
      if (incoming !== process.env.MAIL_TOKEN) {
        return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
    }

    const host = process.env.SES_HOST;
    const port = Number(process.env.SES_PORT) || 465;
    const user = process.env.SES_USER;
    const pass = process.env.SES_PASS;
    const from = process.env.MAIL_FROM;
    // Recipient address must be provided via environment configuration
    const to = process.env.MAIL_TO;

    if (!host || !user || !pass || !from || !to) {
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing mail server configuration' }),
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ' '),
      replyTo,
    });

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ ok: true, messageId: info.messageId }),
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
