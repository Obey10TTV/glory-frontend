# Glory Google authentication setup

Glory uses Google Identity Services in the browser and verifies the returned ID token on the backend. This flow needs a Google OAuth **Web application client ID**, but it does not need a Google client secret.

## Google Cloud

1. Create or select a Google Cloud project.
2. Configure the OAuth consent screen for Glory.
3. Create an OAuth client with the application type **Web application**.
4. Add these Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `https://glory-ca.vercel.app`
   - Add the final custom Glory domain when it is ready.

The popup-based flow does not require an Authorized redirect URI.

## Environment variables

Use the same Web client ID in both services:

- Vercel frontend: `VITE_GOOGLE_CLIENT_ID`
- Railway backend: `GOOGLE_CLIENT_ID`

After adding the variables, redeploy both services. Do not add either value to a committed `.env` file.

Email-created accounts also require the backend SMTP variables shown in the backend `.env.example`. SMTP passwords and all other secrets belong only in Railway environment variables.
