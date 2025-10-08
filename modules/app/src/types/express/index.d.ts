// src/types/express-auth.d.ts
export {};

declare global {
    namespace Express {
        interface Request {
            /**
             * Added by express-oauth2-jwt-bearer
             * See https://github.com/auth0/express-oauth2-jwt-bearer
             */
            auth?: {
                header?: Record<string, unknown>;
                payload: {
                    sub: string;
                    scope?: string;
                    permissions?: string[];
                    // Your custom claims live here as well:
                    [key: string]: unknown;
                };
            };
        }
    }
}
