/** JWT payload shape issued by this service */
export interface JwtPayload {
    sub: string;
    id: number;
    username: string;
    access_level: number;
    organization_id: number;
    iat?: number;
    exp?: number;
}
