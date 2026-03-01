import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly usersService;
    constructor(usersService: UsersService);
    validate(req: Request, payload: {
        sub: string;
    }): Promise<{
        refreshToken: any;
        sub: string;
    }>;
}
export {};
