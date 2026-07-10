//------------------------------------------------------------
// Boilerplate
//------------------------------------------------------------
import {TestRunnerService, getDataSource} from "@auth-app/server";
import {Logger} from "@auth-app/logger";
import {ACCESS_LEVELS, User, UserDao, UserManagementService} from "@auth-app/usermanagement";
import {oidcCallbackHandler, oidcLoginHandler} from "@auth-app/authentication";
import * as HttpStatusCodes from 'http-status-codes';
import {fail} from 'assert';
import chaiHttp = require('chai-http');

var chai = require('chai');
var expect = chai.expect;
chai.use(chaiHttp);
//------------------------------------------------------------
// End Boilerplate
//------------------------------------------------------------

/**
 * SSO / OIDC workflow tests.
 *
 * A live Keycloak instance is NOT available in the test environment, so the
 * authorization-code exchange (`client.callback`) can't be exercised end-to-end
 * over HTTP. Instead:
 *   - HTTP-level tests cover the parts of the flow that don't require a live IdP
 *     (missing session state/nonce short-circuits before any IdP call is made).
 *   - Direct tests call `oidcCallbackHandler` with a fake OIDC client (only
 *     `callbackParams`/`callback` are stubbed) while using the REAL
 *     UserManagementService/UserDao against the test database, so user
 *     auto-provisioning, re-login updates, and disabled-user rejection are all
 *     verified against real DB integration logic.
 */
describe('sso workflow', () => {
    const logger = new Logger();
    const userDao = new UserDao(logger);
    const userManagementService = new UserManagementService(userDao);

    before(async () => {
        try {
            await TestRunnerService.init();
        } catch (e) {
            logger.error(e);
        }
    });

    // ─────────────────────────────────────────────────────────────
    // HTTP-level: routes reachable without a live IdP
    // ─────────────────────────────────────────────────────────────

    it('should redirect (302) to the IdP on GET auth/sso', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent
                .get('auth/sso')
                .redirects(0)
                .catch((err) => err.response);
            // Keycloak may be unavailable in the test env, so accept either:
            // 302 (OIDC client ready) or 503 (OIDC discovery not yet complete)
            expect([
                HttpStatusCodes.StatusCodes.MOVED_TEMPORARILY,
                HttpStatusCodes.StatusCodes.SERVICE_UNAVAILABLE,
            ]).to.include(res.status);

            // When the IdP redirect happens, it must force Keycloak to show the
            // credentials form (prompt=login) rather than silently re-using its
            // own SSO session cookie and signing in as the last-authenticated user.
            if (res.status === HttpStatusCodes.StatusCodes.MOVED_TEMPORARILY) {
                const location = res.headers['location'] || '';
                const promptValue = new URL(location).searchParams.get('prompt');
                expect(promptValue).to.equal('login');
            }
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should redirect to the SPA with an error when auth/callback is hit with no prior SSO session', async () => {
        try {
            // A fresh agent hits the callback directly, without first visiting auth/sso,
            // so req.session.oidcState/oidcNonce are never set. The controller must
            // short-circuit and redirect back to the SPA rather than hang or 500.
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent
                .get('auth/callback')
                .redirects(0)
                .catch((err) => err.response);

            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.MOVED_TEMPORARILY);
            expect(res).to.redirectTo(/error=(missing_state|sso_unavailable)/);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    // ─────────────────────────────────────────────────────────────
    // Direct: forcing the credentials form so users can switch accounts
    // ─────────────────────────────────────────────────────────────

    describe('oidcLoginHandler account switching', () => {
        it('should always request prompt=login so Keycloak does not silently reuse its SSO session', () => {
            let capturedOptions: any = null;
            const fakeClient = {
                authorizationUrl: (options: any) => {
                    capturedOptions = options;
                    return 'http://idp.example.com/authorize?mock=1';
                },
            };

            const req: any = {session: {}};
            const res: any = {redirectedTo: null, redirect(url: string) {
                this.redirectedTo = url;
            }};

            const handler = oidcLoginHandler(fakeClient);
            handler(req, res);

            expect(capturedOptions).to.not.be.null;
            expect(capturedOptions.prompt).to.equal('login');
            expect(capturedOptions.state).to.equal(req.session['oidcState']);
            expect(capturedOptions.nonce).to.equal(req.session['oidcNonce']);
            expect(res.redirectedTo).to.equal('http://idp.example.com/authorize?mock=1');
        });
    });

    // ─────────────────────────────────────────────────────────────
    // Direct: user auto-provisioning / re-login / disabled-user logic
    // ─────────────────────────────────────────────────────────────

    describe('oidcCallbackHandler user provisioning', () => {
        const sub = `sso-test-sub-${Date.now()}`;
        const email = `${sub}@example.com`;
        const fakeIdToken = 'fake.id.token';

        const fakeClient = {
            callbackParams: () => ({}),
            callback: async () => ({
                id_token: fakeIdToken,
                claims: () => ({
                    sub,
                    email,
                    preferred_username: 'ssoIntegrationUser',
                    given_name: 'Sso',
                    family_name: 'Tester',
                }),
            }),
        };

        function buildReqRes() {
            const req: any = {session: {oidcState: 'state123', oidcNonce: 'nonce123'}};
            const res: any = {redirectedTo: null, redirect(url: string) {
                this.redirectedTo = url;
            }};
            return {req, res};
        }

        after(async () => {
            // Clean up the user record this suite created so re-runs stay idempotent.
            await getDataSource().getRepository(User).delete({sub});
        });

        it('should auto-provision a new local user on first SSO login and hand back the id_token', async () => {
            const handler = oidcCallbackHandler(fakeClient, userManagementService, logger);
            const {req, res} = buildReqRes();

            const result = await handler(req, res) as any;

            expect(result).to.not.be.null;
            expect(result.idToken).to.equal(fakeIdToken);

            const user = result.user;
            expect(user.sub).to.equal(sub);
            expect(user.username).to.equal('ssoIntegrationUser');
            expect(user.email).to.equal(email);
            expect(user.access_level).to.equal(ACCESS_LEVELS.OBSERVER);
            expect(user.logins).to.equal(1);

            const persisted = await userManagementService.getUserBySub(sub);
            expect(persisted).to.not.be.null;
            expect(persisted!.username).to.equal('ssoIntegrationUser');
        });

        it('should update the existing user (not duplicate) on a repeat SSO login', async () => {
            const handler = oidcCallbackHandler(fakeClient, userManagementService, logger);
            const {req, res} = buildReqRes();

            const result = await handler(req, res) as any;

            expect(result).to.not.be.null;
            expect(result.user.sub).to.equal(sub);
            expect(result.user.logins).to.equal(2);

            const all = await getDataSource().getRepository(User).find({where: {sub}});
            expect(all).to.have.lengthOf(1);
        });

        it('should reject SSO login for a disabled user', async () => {
            await userManagementService.updateUserBySub(sub, {is_enabled: false});

            const handler = oidcCallbackHandler(fakeClient, userManagementService, logger);
            const {req, res} = buildReqRes();

            const result = await handler(req, res);

            expect(result).to.be.undefined;
            expect(res.redirectedTo).to.include('error=unauthorized');
        });

        it('should redirect with missing_state error when session has no oidcState/oidcNonce', async () => {
            const handler = oidcCallbackHandler(fakeClient, userManagementService, logger);
            const req: any = {session: {}};
            const res: any = {redirectedTo: null, redirect(url: string) {
                this.redirectedTo = url;
            }};

            const result = await handler(req, res);

            expect(result).to.be.undefined;
            expect(res.redirectedTo).to.include('error=missing_state');
        });
    });

    // ─────────────────────────────────────────────────────────────
    // RP-initiated logout — ending the Keycloak SSO session, not just the JWT
    // ─────────────────────────────────────────────────────────────

    describe('logout ends the Keycloak SSO session', () => {
        // Deliberately use a fresh, non-agent request (no cookie jar) for the logout
        // call itself. JWT/SSO clients never carry a session cookie, so this mirrors
        // the real client and exercises the `!hasSession` branch in logout().
        async function getBearerToken(): Promise<string> {
            const loginRes = await chai.request(TestRunnerService.SERVER_ENDPOINT)
                .post('login')
                .send({username: 'root', password: 'Design!123'});
            return loginRes.body.accessToken;
        }

        it('should return a Keycloak end-session URL when the client supplies its OIDC id_token', async () => {
            try {
                const token = await getBearerToken();
                const fakeIdToken = 'header.payload.signature';

                const res = await chai.request(TestRunnerService.SERVER_ENDPOINT)
                    .get('logout')
                    .query({idToken: fakeIdToken})
                    .set('Authorization', `Bearer ${token}`);

                expect(res.status).to.equal(HttpStatusCodes.StatusCodes.OK);
                expect(res.body.ssoLogoutUrl).to.be.a('string').and.not.be.empty;

                const logoutUrl = new URL(res.body.ssoLogoutUrl);
                expect(logoutUrl.searchParams.get('id_token_hint')).to.equal(fakeIdToken);
                expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).to.be.a('string').and.not.be.empty;
            } catch (e: any) {
                logger.error('Error', e);
                fail(e.message);
            }
        });

        it('should fall back to a plain success response when no id_token is supplied', async () => {
            try {
                const token = await getBearerToken();

                const res = await chai.request(TestRunnerService.SERVER_ENDPOINT)
                    .get('logout')
                    .set('Authorization', `Bearer ${token}`);

                expect(res.status).to.equal(HttpStatusCodes.StatusCodes.OK);
                expect(res.body).to.be.true;
            } catch (e: any) {
                logger.error('Error', e);
                fail(e.message);
            }
        });
    });
});
