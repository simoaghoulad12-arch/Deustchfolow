import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Provides the globally-applied AuthGuard (verifies the service token on
 * every request, routes opt out with `@Public()`) and RolesGuard (checks
 * `@Roles(...)` metadata against the verified identity). No business
 * logic lives here — this module is purely the authorization
 * infrastructure shared by every other module.
 */
@Module({
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
