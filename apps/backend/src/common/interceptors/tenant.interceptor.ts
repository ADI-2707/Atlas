import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantStorage } from '@atlas/plugin-sdk';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user && user.organizationId) {
      return tenantStorage.run({ organizationId: user.organizationId }, () => next.handle());
    }
    
    return next.handle();
  }
}
