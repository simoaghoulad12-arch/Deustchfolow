import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

/**
 * Explicit allow-list — combined with the global ValidationPipe's
 * `whitelist: true, forbidNonWhitelisted: true`, any field not listed
 * here (e.g. `role`, `id`) is rejected outright rather than silently
 * dropped or, worse, applied. This is the mass-assignment defense (see
 * architecture decision record, section 8).
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string | null;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;
}
