import { IsBoolean } from 'class-validator';

export class AdminModerateReviewDto {
  @IsBoolean()
  isHidden!: boolean;
}
