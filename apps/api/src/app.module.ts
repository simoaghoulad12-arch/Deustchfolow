import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LearningModule } from './modules/learning/learning.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AiTutorModule } from './modules/ai-tutor/ai-tutor.module';
import { TutorsModule } from './modules/tutors/tutors.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
    // Domain modules — architectural placeholders for now, filled in
    // module by module in the phases that follow the foundation.
    AuthModule,
    UsersModule,
    LearningModule,
    ProgressModule,
    AiTutorModule,
    TutorsModule,
    BookingsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
