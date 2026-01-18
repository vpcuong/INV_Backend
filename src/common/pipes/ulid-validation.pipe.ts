import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Validates ULID format
 * ULID: 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
 * Example: 01ARZ3NDEKTSV4RRFFQ69G5FAV
 */
@Injectable()
export class ULIDValidationPipe implements PipeTransform<string, string> {
  private readonly ulidRegex = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('ULID is required');
    }

    if (!this.ulidRegex.test(value)) {
      throw new BadRequestException(
        `Invalid ULID format: "${value}". ULID must be 26 characters using base32 alphabet (0-9, A-Z excluding I, L, O, U)`
      );
    }

    return value;
  }
}
