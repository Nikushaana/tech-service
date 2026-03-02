import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class TokenValidationGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const result = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        const token = request.cookies?.accessToken;
        const user = request.user;

        if (!token) {
            throw new UnauthorizedException("Token missing");
        }

        if (!user) throw new UnauthorizedException('User not authenticated');

        return result;
    }
}


// import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
// import { AuthGuard } from "@nestjs/passport";
// import { JwtService } from "@nestjs/jwt";

// @Injectable()
// export class TokenValidationGuard extends AuthGuard('jwt') {
//     constructor(private readonly jwtService: JwtService) {
//         super();
//     }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const request = context.switchToHttp().getRequest();
//         const token = request.cookies?.accessToken;

//         // --- 1. No token ---
//         if (!token) {
//             throw new UnauthorizedException("Token missing");
//         }

//         try {
//             // --- 2. Token exists, verify manually ---
//             const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
//             request.user = payload;
//             return true;
//         } catch (err: any) {
//             // --- 3. Token expired ---
//             if (err.name === "TokenExpiredError") {
//                 throw new UnauthorizedException("Token expired");
//             }
//             // --- Invalid token ---
//             throw new UnauthorizedException("Invalid token");
//         }
//     }
// }