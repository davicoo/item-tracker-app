
const { createClient } = require('@supabase/supabase-js');

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
    return {
      statusCode: 405,
      headers: baseHeaders,
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  try {
    const { email, signupUrl } = JSON.parse(event.body || '{}');
    if (!email || !signupUrl) {
      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ ok: false, error: 'Missing required fields' }),
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Missing Supabase service configuration');
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ ok: false, error: 'Server misconfigured' }),
      };
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: signupUrl,
      data: { role: 'store', roles: ['store'] },
    });

    if (error) {
      return {
        statusCode: error.status || 500,
        headers: baseHeaders,
        body: JSON.stringify({
          ok: false,
          error: error.name || 'INVITE_FAILED',
          detail: error.message,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ ok: true, user: data?.user }),
    };
  } catch (err) {
    console.error('Error sending invite:', err);
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({
        ok: false,
        error: err.name || 'INVITE_FAILED',
        detail: err.message,
      }),
    };
  }
};
