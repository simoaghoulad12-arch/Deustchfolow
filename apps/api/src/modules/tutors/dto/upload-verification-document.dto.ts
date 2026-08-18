import { IsBase64, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

/** Small, explicit allowlist — never trust a client-supplied MIME type beyond what this API is prepared to store/serve. */
const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;

export class UploadVerificationDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  label!: string;

  @IsIn(ALLOWED_CONTENT_TYPES)
  contentType!: (typeof ALLOWED_CONTENT_TYPES)[number];

  /** Base64-encoded file bytes — capped well under the ~5MB raw-file mark. No multipart upload pipeline in this foundation phase (see ADR). */
  @IsBase64()
  @MaxLength(7_000_000)
  dataBase64!: string;
}
