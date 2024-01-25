import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
    baseConfig: {
        environment: config.Environment.SANDBOX,
        publishableKey: '[YOUR_PUBLISHABLE_KEY]', // TODO: figure out how to get publishable key, its not provided on the dashboard as expected
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    logoutRedirectUri: process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI!,
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
});

export default config
