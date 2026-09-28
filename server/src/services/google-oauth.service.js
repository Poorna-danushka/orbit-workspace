const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');

const allowedIssuers = new Set(['accounts.google.com', 'https://accounts.google.com']);

const createGoogleOAuthClient = () => {
  if (!env.GOOGLE_OAUTH_CONFIGURED) {
    throw new Error('Google OAuth is not configured');
  }

  return new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_CALLBACK_URL,
  });
};

const createGoogleAuthorizationRequest = async ({ state, nonce }, client = createGoogleOAuthClient()) => {
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
  const authorizationUrl = client.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    response_type: 'code',
    scope: ['openid', 'email', 'profile'],
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return { authorizationUrl, codeVerifier };
};

const verifyGoogleAuthorizationCode = async (
  { code, codeVerifier, nonce },
  client = createGoogleOAuthClient(),
) => {
  if (!env.GOOGLE_OAUTH_CONFIGURED) {
    throw new Error('Google OAuth is not configured');
  }

  const { tokens } = await client.getToken({ code, codeVerifier });
  if (!tokens.id_token) {
    throw new Error('Google did not return an OpenID Connect identity token');
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const identity = ticket.getPayload();

  if (
    !identity ||
    !allowedIssuers.has(identity.iss) ||
    identity.nonce !== nonce ||
    typeof identity.sub !== 'string' ||
    !identity.sub ||
    typeof identity.email !== 'string' ||
    identity.email_verified !== true
  ) {
    throw new Error('Google OpenID Connect identity could not be verified');
  }

  return {
    sub: identity.sub,
    email: identity.email.toLowerCase(),
    emailVerified: identity.email_verified,
    name: typeof identity.name === 'string' ? identity.name : '',
    picture: typeof identity.picture === 'string' ? identity.picture : null,
  };
};

module.exports = {
  createGoogleOAuthClient,
  createGoogleAuthorizationRequest,
  verifyGoogleAuthorizationCode,
};
