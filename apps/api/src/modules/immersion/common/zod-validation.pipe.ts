import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType, ZodTypeDef } from 'zod';

/**
 * Zod-based request validation for the immersion module. Used as
 * `@Body(new ZodValidationPipe(schema))`; the global class-validator
 * ValidationPipe skips these params because their metatype is a plain
 * interface. Unknown keys are rejected via `.strict()` schemas — the same
 * mass-assignment defence the rest of the API gets from
 * `forbidNonWhitelisted`.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T, ZodTypeDef, unknown>) {}

  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new BadRequestException(
        issue ? `${issue.path.join('.') || 'body'}: ${issue.message}` : 'Invalid request body.',
      );
    }
    return parsed.data;
  }
}
