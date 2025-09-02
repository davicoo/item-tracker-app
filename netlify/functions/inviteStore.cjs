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

    // Create store user in Supabase
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

    // Verify caller's session
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, headers: baseHeaders, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    const accessToken = authHeader.split(' ')[1];
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    const caller = userData?.user;
    if (userError || !caller || caller.user_metadata?.role !== 'admin') {
      return { statusCode: 403, headers: baseHeaders, body: JSON.stringify({ error: 'Forbidden' }) };
    }
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

