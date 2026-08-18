import { IsIn } from 'class-validator';

export class AdminVerificationDecisionDto {
  @IsIn(['VERIFIED', 'REJECTED'])
  status!: 'VERIFIED' | 'REJECTED';
}
