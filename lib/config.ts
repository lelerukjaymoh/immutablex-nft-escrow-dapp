import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
    baseConfig: {
        environment: config.Environment.SANDBOX,
        publishableKey: process.env.NEXT_PUBLIC_IMMUTABLE_PUBLISHABLE_KEY,
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    logoutRedirectUri: process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI!,
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
});

export default config
