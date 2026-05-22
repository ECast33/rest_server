import {Strategy as JwtStrategy, ExtractJwt, StrategyOptions} from 'passport-jwt';
import * as Config from 'app-config';
import {UserManagementService} from '@imitate/usermanagement';
import {Logger} from '@imitate/logger';
import {JwtPayload} from '../services/jwt-payload.interface';

export function buildJwtStrategy(userManagementService: UserManagementService, logger: Logger) {
    const options: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: Config.oidc.JWT_SECRET,
        issuer: undefined,
        audience: undefined,
    };

    return new JwtStrategy(options, async (payload: JwtPayload, done) => {
        try {
            const user = await userManagementService.getUserById(payload.id);
            if (!user) {
                return done(null, false);
            }
            if (!user.is_enabled) {
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            logger.error('JWT strategy error', error);
            return done(error, false);
        }
    });
}

export const JWT_STRATEGY_NAME = 'jwt';
