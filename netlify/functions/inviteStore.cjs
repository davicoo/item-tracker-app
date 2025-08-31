const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

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
    const { email, name, password, loginUrl } = JSON.parse(event.body || '{}');

    if (!email || !password || !loginUrl) {
      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    if (process.env.MAIL_TOKEN) {
      const incoming = event.headers['x-mail-token'] || event.headers['X-Mail-Token'];
      if (incoming !== process.env.MAIL_TOKEN) {
        return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
    }

    // Create store user in Supabase
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
    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'store' },
    });
    if (createError) {
      console.error('Error creating user:', createError);
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'User creation failed', detail: createError.message }),
      };
    }

    // Send invite email
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

    const subject = `Your store login for ${name || email}`;
    const html = `<p>Hello ${name || ''},</p><p>Your store account has been created.</p><p><strong>Email:</strong> ${email}<br><strong>Password:</strong> ${password}</p><p><a href="${loginUrl}">Log in here</a></p>`;

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
    console.error('Error inviting store:', err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ ok: false, error: err.name || 'INVITE_FAILED', detail: err.message }),
    };
  }
};

