import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Agencies
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

// 2. Categories
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

// 3. Notices
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

// 4. Notice Revisions (Immutable Snapshots)
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  noticeRevisionIdx: uniqueIndex('notice_revision_unique').on(table.noticeId, table.revisionNumber),
}));

// 6. MCQ Tests
export const mcqTests = pgTable('mcq_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  titleHi: text('title_hi').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionHi: text('description_hi').default('').notNull(),
  descriptionEn: text('description_en').default('').notNull(),
  durationMinutes: integer('duration_minutes').default(10).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. MCQ Questions
export const mcqQuestions = pgTable('mcq_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  testId: uuid('test_id').notNull().references(() => mcqTests.id, { onDelete: 'cascade' }),
  questionHi: text('question_hi').notNull(),
  questionEn: text('question_en').notNull(),
  optionsJson: jsonb('options_json').notNull(),
  correctOption: integer('correct_option').default(0).notNull(),
  explanationHi: text('explanation_hi').default('').notNull(),
  explanationEn: text('explanation_en').default('').notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  mcqTestIdx: index('mcq_questions_test_idx').on(table.testId),
}));

export const mcqTestsRelations = relations(mcqTests, ({ many }) => ({
  questions: many(mcqQuestions),
}));

export const mcqQuestionsRelations = relations(mcqQuestions, ({ one }) => ({
  test: one(mcqTests, { fields: [mcqQuestions.testId], references: [mcqTests.id] }),
}));

// Relations
export const noticesRelations = relations(notices, ({ one, many }) => ({
  agency: one(agencies, { fields: [notices.agencyId], references: [agencies.id] }),
  category: one(categories, { fields: [notices.categoryId], references: [categories.id] }),
  revisions: many(noticeRevisions),
}));

export const revisionsRelations = relations(noticeRevisions, ({ one }) => ({
  notice: one(notices, { fields: [noticeRevisions.noticeId], references: [notices.id] }),
}));

// 5. Notifications (Broadcast & Push)
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  noticeId: uuid('notice_id').references(() => notices.id, { onDelete: 'set null' }),
  noticeSlug: text('notice_slug'),
  agencyName: text('agency_name'),
  notificationType: text('notification_type').default('newVacancy').notNull(), // 'newVacancy' | 'admitCard' | 'result' | 'correction' | 'closingSoon'
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. Push Devices (Registered device tokens)
export const pushDevices = pgTable('push_devices', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  platform: text('platform').default('android').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_push_devices_user_id').on(table.userId),
}));
