import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminService } from './admin.service';

const ListSchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().min(1).max(10000).optional(),
    languageCode: z.string().regex(/^[a-z]{2}$/).optional(),
  })
  .strict();
const IdSchema = z.string().min(1).max(120);
const RoleSchema = z.object({ role: z.enum(['STUDENT', 'TUTOR', 'CONTENT_EDITOR', 'SUPPORT', 'ADMIN']) }).strict();

/** Content CMS — editors manage learning content; platform settings and users are admin-only. */
@Controller('live/admin')
@Roles(UserRole.ADMIN, UserRole.CONTENT_EDITOR)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  registry(@CurrentUser() user: AuthenticatedUser) {
    return this.admin.registry(user.role);
  }

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('users')
  @Roles(UserRole.ADMIN)
  users(@Query(new ZodValidationPipe(ListSchema)) query: z.infer<typeof ListSchema>) {
    return this.admin.users(query);
  }

  @Patch('users/:id/role')
  @Roles(UserRole.ADMIN)
  setRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(RoleSchema)) body: z.infer<typeof RoleSchema>,
  ) {
    return this.admin.setRole(user.id, id, body.role as UserRole);
  }

  @Get('content/:resource')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('resource') resource: string,
    @Query(new ZodValidationPipe(ListSchema)) query: z.infer<typeof ListSchema>,
  ) {
    return this.admin.list(resource, user.role, query);
  }

  @Get('content/:resource/:id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('resource') resource: string, @Param('id', new ZodValidationPipe(IdSchema)) id: string) {
    return this.admin.get(resource, user.role, id);
  }

  @Post('content/:resource')
  create(@CurrentUser() user: AuthenticatedUser, @Param('resource') resource: string, @Body() body: unknown) {
    return this.admin.create(resource, user.role, body);
  }

  @Patch('content/:resource/:id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('resource') resource: string,
    @Param('id', new ZodValidationPipe(IdSchema)) id: string,
    @Body() body: unknown,
  ) {
    return this.admin.update(resource, user.role, id, body);
  }

  @Delete('content/:resource/:id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('resource') resource: string, @Param('id', new ZodValidationPipe(IdSchema)) id: string) {
    return this.admin.remove(resource, user.role, id);
  }
}
