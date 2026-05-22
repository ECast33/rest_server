import * as jwt from 'jsonwebtoken';
import * as Config from 'app-config';
import {User} from '@imitate/usermanagement';
import {JwtPayload} from './jwt-payload.interface';

export class TokenService {

    generateAccessToken(user: User): string {
        const payload: JwtPayload = {
            sub: user.sub || String(user.id),
            id: user.id,
            username: user.username,
            access_level: user.access_level,
            organization_id: user.organization_id,
        };
        return jwt.sign(payload, Config.oidc.JWT_SECRET, {
            expiresIn: Config.oidc.JWT_EXPIRY,
        } as jwt.SignOptions);
    }

    generateRefreshToken(user: User): string {
        const payload = {sub: user.sub || String(user.id), id: user.id};
        return jwt.sign(payload, Config.oidc.REFRESH_TOKEN_SECRET, {
            expiresIn: Config.oidc.REFRESH_TOKEN_EXPIRY,
        } as jwt.SignOptions);
    }

    verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, Config.oidc.JWT_SECRET) as JwtPayload;
    }

    verifyRefreshToken(token: string): {sub: string; id: number} {
        return jwt.verify(token, Config.oidc.REFRESH_TOKEN_SECRET) as {sub: string; id: number};
    }

    buildTokenResponse(user: User): {accessToken: string; refreshToken: string; expiresIn: string} {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
            expiresIn: Config.oidc.JWT_EXPIRY,
        };
    }
}
