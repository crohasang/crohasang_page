import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const expectedToken = process.env.MICRO_POSTS_ADMIN_TOKEN;
    if (!expectedToken) {
      throw new UnauthorizedException('MICRO_POSTS_ADMIN_TOKEN is not configured');
    }

    const headerValue = req.headers['x-admin-token'];
    const token = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!token || token !== expectedToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    return true;
  }
}
