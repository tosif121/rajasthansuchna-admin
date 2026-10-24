import { pgTable, uuid, text, boolean, integer, timestamp, date, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Admin Users & Roles
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authSubject: text('auth_subject'),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const adminRoles = pgTable('admin_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // 'administrator' | 'editor' | 'reviewer' | 'publisher'
  description: text('description'),
});

export const adminUserRoles = pgTable('admin_user_roles', {
  userId: uuid('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => adminRoles.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: uniqueIndex('admin_user_roles_pk').on(table.userId, table.roleId),
}));

// 2. Agencies
export const agencies = pgTable('agencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nameHi: text('name_hi').notNull(),
  nameEn: text('name_en').notNull(),
  code: text('code').notNull(),
  parentGroup: text('parent_group').notNull(), // 'rajasthan' | 'central'
  officialUrl: text('official_url').notNull(),
  logoAsset: text('logo_asset'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Categories
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nameHi: text('name_hi').notNull(),
  nameEn: text('name_en').notNull(),
  parentId: uuid('parent_id'),
  icon: text('icon'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Notices
export const notices = pgTable('notices', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  state: text('state').default('rajasthan').notNull(), // 'rajasthan' | 'central'
  noticeType: text('notice_type').default('vacancy').notNull(), // 'vacancy' | 'admitCard' | 'result' | 'answerKey' | 'scheme'
  status: text('status').default('active').notNull(), // 'active' | 'inactive'
  currentRevisionId: uuid('current_revision_id'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isBreaking: boolean('is_breaking').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('notices_status_idx').on(table.status),
  publishedAtIdx: index('notices_published_at_idx').on(table.publishedAt),
  agencyIdx: index('notices_agency_idx').on(table.agencyId),
  categoryIdx: index('notices_category_idx').on(table.categoryId),
}));

// 5. Notice Revisions (Immutable Snapshots)
export const noticeRevisions = pgTable('notice_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  noticeId: uuid('notice_id').notNull().references(() => notices.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  titleHi: text('title_hi').notNull(),
  titleEn: text('title_en').notNull(),
  summaryHi: text('summary_hi').notNull(),
  summaryEn: text('summary_en').notNull(),
  factsJson: jsonb('facts_json').notNull(), // Recruitment facts matching Flutter RecruitmentFacts
  sectionsJson: jsonb('sections_json').notNull(), // Array of ArticleSection
  linksJson: jsonb('links_json').notNull(), // Array of OfficialLink
  revisionNotes: text('revision_notes'),
  createdBy: uuid('created_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  noticeRevisionIdx: uniqueIndex('notice_revision_unique').on(table.noticeId, table.revisionNumber),
}));

// 6. Structured Dates for Notice Deadlines
export const noticeDates = pgTable('notice_dates', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().references(() => noticeRevisions.id, { onDelete: 'cascade' }),
  dateType: text('date_type').notNull(), // 'applicationStart' | 'applicationEnd' | 'feeEndDate' | 'examDate'
  eventDate: date('event_date').notNull(),
  timezone: text('timezone').default('Asia/Kolkata').notNull(),
});

// 7. Official Document Attachments
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  storageKey: text('storage_key').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  checksum: text('checksum'),
  visibility: text('visibility').default('public').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 8. Workflow Events
export const workflowEvents = pgTable('workflow_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  noticeId: uuid('notice_id').notNull().references(() => notices.id, { onDelete: 'cascade' }),
  revisionId: uuid('revision_id').references(() => noticeRevisions.id),
  actorId: uuid('actor_id').references(() => adminUsers.id),
  action: text('action').notNull(), // 'created_draft' | 'submitted_review' | 'changes_requested' | 'approved' | 'published' | 'archived'
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  noticeWorkflowIdx: index('workflow_notice_idx').on(table.noticeId),
}));

// 9. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => adminUsers.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('audit_entity_idx').on(table.entityType, table.entityId),
  createdIdx: index('audit_created_idx').on(table.createdAt),
}));

// Relations
export const noticesRelations = relations(notices, ({ one, many }) => ({
  agency: one(agencies, { fields: [notices.agencyId], references: [agencies.id] }),
  category: one(categories, { fields: [notices.categoryId], references: [categories.id] }),
  revisions: many(noticeRevisions),
  workflowEvents: many(workflowEvents),
}));

export const revisionsRelations = relations(noticeRevisions, ({ one, many }) => ({
  notice: one(notices, { fields: [noticeRevisions.noticeId], references: [notices.id] }),
  creator: one(adminUsers, { fields: [noticeRevisions.createdBy], references: [adminUsers.id] }),
  dates: many(noticeDates),
}));
