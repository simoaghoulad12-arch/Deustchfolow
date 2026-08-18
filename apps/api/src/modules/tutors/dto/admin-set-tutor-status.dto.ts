import { IsBoolean } from 'class-validator';

export class AdminSetTutorStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
