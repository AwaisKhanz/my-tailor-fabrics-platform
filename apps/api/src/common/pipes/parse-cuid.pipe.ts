import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  CUID_PATTERN,
  INVALID_RESOURCE_IDENTIFIER_MESSAGE,
} from '../validators/is-cuid-string';

@Injectable()
export class ParseCuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!CUID_PATTERN.test(value)) {
      throw new BadRequestException(INVALID_RESOURCE_IDENTIFIER_MESSAGE);
    }

    return value;
  }
}
