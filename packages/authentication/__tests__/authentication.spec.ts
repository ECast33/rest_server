//------------------------------------------------------------
// Boilerplate
//------------------------------------------------------------
import {TestRunnerService} from "@auth-app/server";
import {Logger} from "@auth-app/logger";
import * as HttpStatusCodes from 'http-status-codes';
import {equal, fail} from 'assert';
import chaiHttp = require('chai-http');

var chai = require('chai');
var expect = chai.expect;
chai.use(chaiHttp);
//------------------------------------------------------------
// End Boilerplate
//------------------------------------------------------------


describe('authentication', () => {
    const logger = new Logger();
    let accessToken: string;
    let refreshToken: string;

    before(async () => {
        try {
            await TestRunnerService.init();
        } catch (e) {
            logger.error(e);
        }
    });

    // ─────────────────────────────────────────────────────────────
    // Local login (username / password)
    // ─────────────────────────────────────────────────────────────

    it('should FAIL to login with wrong credentials', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent.post('login').send({
                username: 'INTEGRATION_TEST_USER',
                password: 'WRONG2@@###$4'
            });
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should FAIL to login with missing password', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent.post('login').send({username: 'root'});
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.BAD_REQUEST);
            expect(res.body.error).to.be.a('string').and.not.be.empty;
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should FAIL to login with missing username', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent.post('login').send({password: 'Design!123'});
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.BAD_REQUEST);
            expect(res.body.error).to.be.a('string').and.not.be.empty;
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should login successfully and return JWT tokens', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent.post('login').send({
                username: 'root',
                password: 'Design!123'
            });
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            expect(res.body).to.not.be.null;

            // User profile in response
            expect(res.body.user).to.not.be.null;
            expect(res.body.user.username).to.equal('root');
            expect(res.body.user.password).to.equal('REDACTED');

            // JWT tokens present
            expect(res.body.accessToken).to.be.a('string').and.not.be.empty;
            expect(res.body.refreshToken).to.be.a('string').and.not.be.empty;
            expect(res.body.expiresIn).to.be.a('string').and.not.be.empty;

            // JWT has three parts (header.payload.signature)
            expect(res.body.accessToken.split('.')).to.have.lengthOf(3);
            expect(res.body.refreshToken.split('.')).to.have.lengthOf(3);

            // Store for downstream tests
            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    // ─────────────────────────────────────────────────────────────
    // isLoggedIn — JWT-protected route
    // ─────────────────────────────────────────────────────────────

    it('should return isLoggedIn=true with a valid Bearer token', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent
                .get('isLoggedIn')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            expect(res.body.isLoggedIn).to.be.true;
            expect(res.body.userProfile).to.not.be.null;
            expect(res.body.userProfile.username).to.equal('root');
            expect(res.body.userProfile.password).to.equal('REDACTED');
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should FAIL isLoggedIn with no token', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent.get('isLoggedIn');
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should FAIL isLoggedIn with an invalid Bearer token', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent
                .get('isLoggedIn')
                .set('Authorization', 'Bearer this.is.not.a.valid.jwt');
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    // ─────────────────────────────────────────────────────────────
    // Token refresh
    // ─────────────────────────────────────────────────────────────

    it('should exchange a refresh token for a new access token', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent
                .post('auth/refresh')
                .send({refreshToken});
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            expect(res.body.accessToken).to.be.a('string').and.not.be.empty;
            expect(res.body.accessToken.split('.')).to.have.lengthOf(3);
            expect(res.body.expiresIn).to.be.a('string').and.not.be.empty;
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should FAIL token refresh with a bad refresh token', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent
                .post('auth/refresh')
                .send({refreshToken: 'not.a.real.token'});
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should FAIL token refresh with missing body', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent.post('auth/refresh').send({});
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.BAD_REQUEST);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    // ─────────────────────────────────────────────────────────────
    // SSO redirect endpoints (smoke tests — no full IdP required)
    // ─────────────────────────────────────────────────────────────

    it('should redirect (302) to the IdP on GET auth/sso', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            // chai-http follows redirects by default — disable so we can inspect the 302
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
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    // ─────────────────────────────────────────────────────────────
    // Logout
    // ─────────────────────────────────────────────────────────────

    it('should login and logout successfully', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const loginRes = await agent.post('login').send({
                username: 'root',
                password: 'Design!123'
            });
            expect(loginRes.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            const token = loginRes.body.accessToken;

            const logoutRes = await agent
                .get('logout')
                .set('Authorization', `Bearer ${token}`);
            expect(logoutRes.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            expect(logoutRes.body).to.be.true;
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should FAIL to logout without a token', async () => {
        try {
            const agent = chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            const res = await agent.get('logout');
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });
});

