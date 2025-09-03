const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');
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

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_KEY;
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
    const roles = require('./_auth.cjs').getRoles(caller);
    if (userError || !caller || !roles.includes('store')) {
      return { statusCode: 403, headers: baseHeaders, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    const region = process.env.AWS_REGION || process.env.SES_REGION;
    const from = process.env.MAIL_FROM;
    if (!region || !from) {
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing mail server configuration' }),
      };
    }

    const ses = new SESv2Client({ region });
    const subject = 'Your item has sold';
    const html = `<p>Great news! Your item <strong>${itemName}</strong> has sold.</p>`;

    const command = new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [email] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: {
            Html: { Data: html },
            Text: { Data: html.replace(/<[^>]+>/g, ' ') },
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
    console.error('Error sending sold notification:', err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ ok: false, error: err.name || 'EMAIL_SEND_FAILED', detail: err.message }),
    };
  }
};
