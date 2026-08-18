import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LearningModule } from './modules/learning/learning.module';
import { EntitlementsModule } from './modules/entitlements/entitlements.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AiModule } from './modules/ai/ai.module';
import { TutorsModule } from './modules/tutors/tutors.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { GermanyModule } from './modules/germany/germany.module';
import { SimulationsModule } from './modules/simulations/simulations.module';
import { CareerModule } from './modules/career/career.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    LearningModule,
    EntitlementsModule,
    AiModule,
    // Remaining domain modules — still architectural placeholders, filled
    // in module by module in the phases that follow.
    ProgressModule,
    TutorsModule,
    BookingsModule,
    ReviewsModule,
    GermanyModule,
    SimulationsModule,
    CareerModule,
    PaymentsModule,
  ],
})
export class AppModule {}
