//------------------------------------------------------------
// Boilerplate
//------------------------------------------------------------
import {TestRunnerService} from "@imitate/server";
import {Logger} from "@imitate/logger";
import * as HttpStatusCodes from 'http-status-codes';
import {equal, fail} from 'assert';
import chaiHttp = require('chai-http');

var chai = require('chai');
var expect = chai.expect;
chai.use(chaiHttp);
//------------------------------------------------------------
// End Boilerplate
//------------------------------------------------------------


describe('@imitate/authentication', () => {
    const logger = new Logger();
    before(async () => {
        try {
            const server: unknown = await TestRunnerService.init();

        } catch (e) {
            logger.error(e)
        }
    });

    it('should FAIL to login', async () => {
        try {
            let agent = await chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            let res = await agent.post('login').send({
                username: 'INTEGRATION_TEST_USER',
                password: 'WRONG2@@###$4'
            });
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });


    it('should login success ', async () => {
        try {
            let agent = await chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            let res = await agent.post('login').send({
                username: 'root',
                password: 'Design!123'
            });
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            expect(res.body).to.not.be.null;
            expect(res.body.username).to.equal('root');
            let isLoggedIn = await agent.get('isLoggedIn');
            expect(isLoggedIn.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            expect(isLoggedIn.body).to.not.be.null;
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });

    it('should login and logout success ', async () => {
        try {
            let agent = await chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            let res = await agent.post('login').send({
                username: 'root',
                password: 'Design!123'
            });
            expect(res.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            expect(res.body).to.not.be.null;
            expect(res.body.username).to.equal('root');
            let logout = await agent.get('logout');
            expect(logout.status).to.equal(HttpStatusCodes.StatusCodes.OK);
            expect(logout.body).to.be.true;
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }
    });
});
