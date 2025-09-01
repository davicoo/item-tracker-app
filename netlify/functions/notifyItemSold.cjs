const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const baseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: baseHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: baseHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, itemName } = JSON.parse(event.body || '{}');
    if (!email || !itemName) {
      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing Supabase configuration' }),
      };
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const accessToken = authHeader.split(' ')[1];
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    const caller = userData?.user;
    if (userError || !caller || caller.user_metadata?.role !== 'store') {
      return { statusCode: 403, headers: baseHeaders, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    const host = process.env.SES_HOST;
    const port = Number(process.env.SES_PORT) || 465;
    const user = process.env.SES_USER;
    const pass = process.env.SES_PASS;
    const from = process.env.MAIL_FROM;

    if (!host || !user || !pass || !from) {
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

    const subject = 'Your item has sold';
    const html = `<p>Great news! Your item <strong>${itemName}</strong> has sold.</p>`;

    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ' '),
    });

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ ok: true, messageId: info.messageId }),
    };
  } catch (err) {
    console.error('Error sending sold notification:', err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ ok: false, error: err.name || 'EMAIL_SEND_FAILED', detail: err.message }),
    };
  }
};
