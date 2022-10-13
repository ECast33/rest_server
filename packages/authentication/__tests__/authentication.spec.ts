//------------------------------------------------------------
// Boilerplate
//------------------------------------------------------------
// import * as chai from 'chai';
import {TestRunnerService, Worker} from "@imitate/server";
import {Logger} from "@imitate/logger";
import * as HttpStatusCodes from 'http-status-codes';
import {fail} from 'assert';
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
            logger.info('after');
            let agent = await chai.request.agent(TestRunnerService.SERVER_ENDPOINT);
            let res = await agent.post('login').send({
                username: 'INTEGRATION_TEST_USER',
                password: 'WRONG2@@###$4'
            });
            // chai.expect(err).to.not.be.null;
            chai.expect(res.status).to.equal(HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        } catch (e: any) {
            logger.error('Error', e);
            fail(e.message);
        }

    });
});
