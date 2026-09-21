import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';
import { exec } from 'node:child_process';
import { google } from 'googleapis';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

// Gmail permission needed to send ID-card emails.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('\nMissing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env\n');
  console.error('Your .env should contain:');
  console.error('GOOGLE_CLIENT_ID=...');
  console.error('GOOGLE_CLIENT_SECRET=...');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
  include_granted_scopes: true,
});

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://localhost:${PORT}`);

    if (requestUrl.pathname !== '/oauth2callback') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const error = requestUrl.searchParams.get('error');
    const code = requestUrl.searchParams.get('code');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h2>Google authorization failed</h2><p>${error}</p>`);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Authorization code not found.');
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);

    console.log('\n==========================================');
    console.log('Google authorization successful!');
    console.log('==========================================\n');

    if (tokens.refresh_token) {
      console.log('REFRESH TOKEN:');
      console.log(tokens.refresh_token);
      console.log('\nCopy ONLY the refresh token into your .env:');
      console.log('GOOGLE_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_HERE\n');
    } else {
      console.log('No refresh token was returned.');
      console.log('The script requested offline access + consent.');
      console.log('If this app was already authorized, revoke its access');
      console.log('from your Google Account and run this script again.\n');
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!doctype html>
      <html>
        <body style="font-family:Arial;padding:40px">
          <h2>Life-Vision Gmail authorization successful.</h2>
          <p>You can close this browser tab and return to PowerShell.</p>
          <p><b>Do not share the refresh token with anyone.</b></p>
        </body>
      </html>
    `);

    setTimeout(() => server.close(() => process.exit(0)), 500);
  } catch (err) {
    console.error('\nOAuth error:', err.response?.data || err.message || err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('OAuth failed. Check the PowerShell window for details.');
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nCallback server running at ${REDIRECT_URI}`);
  console.log('\nOpening Google authorization page...\n');

  const command =
    process.platform === 'win32'
      ? `start "" "${authUrl}"`
      : process.platform === 'darwin'
        ? `open "${authUrl}"`
        : `xdg-open "${authUrl}"`;

  exec(command, (err) => {
    if (err) {
      console.log('Could not open the browser automatically.');
      console.log('Open this URL manually:\n');
      console.log(authUrl);
    }
  });
});
