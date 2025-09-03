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
    const { email, name, loginUrl } = JSON.parse(event.body || '{}');

    if (!email || !loginUrl) {
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
    const roles = require('./_auth.cjs').getRoles(caller);
    if (userError || !caller || !roles.includes('admin')) {
      return { statusCode: 403, headers: baseHeaders, body: JSON.stringify({ error: 'Forbidden' }) };
    }
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: { name, role: 'store', roles: ['store'] },
        redirectTo: loginUrl,
      },
    );
    if (inviteError) {
      console.error('Error inviting user:', inviteError);
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'User invite failed', detail: inviteError.message }),
      };
    }

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({ ok: true }),
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

