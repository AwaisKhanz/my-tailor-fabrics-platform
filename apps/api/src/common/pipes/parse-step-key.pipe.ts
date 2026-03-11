import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const STEP_KEY_PATTERN = /^[A-Z0-9_]+$/;

@Injectable()
export class ParseStepKeyPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const normalized = value.trim().toUpperCase();

    if (!normalized || !STEP_KEY_PATTERN.test(normalized)) {
      throw new BadRequestException(
        'Invalid workflow step key. Use only A-Z, 0-9, and _.',
      );
    }

    return normalized;
  }
}
