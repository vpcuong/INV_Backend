import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const INTERNAL_FIELDS = ['rowMode'];

function stripFields(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(stripFields);
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const key of Object.keys(data)) {
      if (!INTERNAL_FIELDS.includes(key)) {
        result[key] = stripFields(data[key]);
      }
    }
    return result;
  }

  return data;
}

@Injectable()
export class StripInternalFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => stripFields(data)));
  }
}