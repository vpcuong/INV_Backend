import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
const INTERNAL_FIELDS = ['rowMode'];

function isDecimal(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.toNumber === 'function' &&
    typeof value.s === 'number' &&
    typeof value.e === 'number' &&
    Array.isArray(value.d)
  );
}

function transformResponse(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Convert Prisma Decimal to number
  if (isDecimal(data)) {
    return data.toNumber();
  }

  if (Array.isArray(data)) {
    return data.map(transformResponse);
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const key of Object.keys(data)) {
      if (!INTERNAL_FIELDS.includes(key)) {
        result[key] = transformResponse(data[key]);
      }
    }
    return result;
  }

  return data;
}

@Injectable()
export class StripInternalFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => transformResponse(data)));
  }
}