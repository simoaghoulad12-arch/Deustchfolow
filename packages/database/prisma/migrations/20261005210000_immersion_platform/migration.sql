-- CreateEnum
CREATE TYPE "MissionMode" AS ENUM ('MISSION', 'CHAOS', 'STORY', 'DEBATE', 'DAILY');

-- CreateEnum
CREATE TYPE "MissionRunStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MistakeCategory" AS ENUM ('GRAMMAR', 'VOCABULARY', 'PRONUNCIATION', 'SENTENCE_STRUCTURE', 'WORD_CHOICE', 'SPELLING', 'REGISTER');

-- CreateEnum
CREATE TYPE "MasteryState" AS ENUM ('NEW', 'PRACTICING', 'MASTERED');

-- CreateEnum
CREATE TYPE "DnaDimension" AS ENUM ('VOCABULARY', 'GRAMMAR', 'SPEAKING', 'LISTENING', 'READING', 'WRITING', 'PRONUNCIATION', 'FLUENCY', 'ACCURACY', 'RESPONSE_SPEED');

-- CreateEnum
CREATE TYPE "PracticeExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_BLANK', 'SENTENCE_ORDER', 'TRANSLATION', 'ERROR_CORRECTION', 'MATCHING', 'READING_COMPREHENSION', 'LISTENING_COMPREHENSION', 'FREE_WRITING', 'SPEAKING', 'CONVERSATION');

-- CreateEnum
CREATE TYPE "PracticeMode" AS ENUM ('SPEAKING', 'BRAIN', 'EMOTION', 'PLACEMENT');

-- CreateEnum
CREATE TYPE "GrammarStage" AS ENUM ('EXPLANATION', 'EXAMPLES', 'GUIDED', 'AI_PRACTICE', 'FREE', 'ASSESSMENT', 'MASTERED');

-- DropIndex
DROP INDEX "courses_levelId_order_key";

-- DropIndex
DROP INDEX "vocabulary_normalized_word_level_key";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "language_code" TEXT NOT NULL DEFAULT 'de';

-- AlterTable
ALTER TABLE "learning_profiles" ADD COLUMN     "daily_minutes" INTEGER,
ADD COLUMN     "goals" TEXT[],
ADD COLUMN     "learning_styles" TEXT[],
ADD COLUMN     "onboarding_completed_at" TIMESTAMP(3),
ADD COLUMN     "personal_goal" TEXT,
ADD COLUMN     "target_language_code" TEXT;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "content" JSONB;

-- AlterTable
ALTER TABLE "user_vocabulary" ADD COLUMN     "confidence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
ADD COLUMN     "interval_days" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "repetitions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "vocabulary" ADD COLUMN     "article" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "difficulty" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "frequency" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "language_code" TEXT NOT NULL DEFAULT 'de',
ADD COLUMN     "plural" TEXT,
ADD COLUMN     "pronunciation" TEXT;

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "is_target" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_stats" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" TEXT,
    "learning_minutes" INTEGER NOT NULL DEFAULT 0,
    "speaking_minutes" INTEGER NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "proficiency" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_environments" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "accent" TEXT NOT NULL DEFAULT 'indigo',
    "min_level" "CEFRLevel" NOT NULL DEFAULT 'A1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "speaking_style" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "environmentId" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cefr_level" "CEFRLevel" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "language_code" TEXT NOT NULL,
    "mode" "MissionMode" NOT NULL DEFAULT 'MISSION',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "cefr_level" "CEFRLevel" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "required_skills" "LearningSkill"[],
    "estimated_minutes" INTEGER NOT NULL DEFAULT 5,
    "xp_reward" INTEGER NOT NULL DEFAULT 100,
    "key_phrases" JSONB NOT NULL DEFAULT '[]',
    "grammar_focus" TEXT,
    "criteria" JSONB NOT NULL DEFAULT '[]',
    "opening_line" TEXT NOT NULL,
    "extra" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "environmentId" UUID,
    "characterId" UUID,
    "storyId" UUID,
    "chapter" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_runs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "missionId" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "status" "MissionRunStatus" NOT NULL DEFAULT 'ACTIVE',
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "turn_count" INTEGER NOT NULL DEFAULT 0,
    "hints_used" INTEGER NOT NULL DEFAULT 0,
    "criteria_met" TEXT[],
    "scores" JSONB,
    "score" INTEGER,
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,
    "state" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "mission_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistakes" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "category" "MistakeCategory" NOT NULL,
    "original" TEXT NOT NULL,
    "corrected" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "correct_streak" INTEGER NOT NULL DEFAULT 0,
    "mastery_state" "MasteryState" NOT NULL DEFAULT 'NEW',
    "source" TEXT NOT NULL DEFAULT 'mission',
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mistakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dna_scores" (
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "dimension" "DnaDimension" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "samples" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dna_scores_pkey" PRIMARY KEY ("userId","language_code","dimension")
);

-- CreateTable
CREATE TABLE "dna_snapshots" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dna_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_topics" (
    "id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cefr_level" "CEFRLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "examples" JSONB NOT NULL DEFAULT '[]',
    "practice_prompt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_progress" (
    "userId" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "stage" "GrammarStage" NOT NULL DEFAULT 'EXPLANATION',
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_progress_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateTable
CREATE TABLE "practice_exercises" (
    "id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "cefr_level" "CEFRLevel" NOT NULL,
    "type" "PracticeExerciseType" NOT NULL,
    "skill" "LearningSkill" NOT NULL,
    "prompt" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "is_placement" BOOLEAN NOT NULL DEFAULT false,
    "grammarTopicId" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_attempts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "exerciseId" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "mode" "PracticeMode" NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "response_ms" INTEGER,
    "scores" JSONB NOT NULL,
    "feedback" JSONB,
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_logs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "criteria" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "userId" UUID NOT NULL,
    "achievementId" UUID NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("userId","achievementId")
);

-- CreateTable
CREATE TABLE "challenge_templates" (
    "id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "cefr_level" "CEFRLevel" NOT NULL,
    "focus" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "challenge_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_challenges" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "response" TEXT,
    "feedback" JSONB,
    "completed_at" TIMESTAMP(3),
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "corrected_text" TEXT,
    "analysis" JSONB,
    "score" INTEGER,
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_plans" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "start_level" "CEFRLevel" NOT NULL,
    "target_level" "CEFRLevel" NOT NULL,
    "daily_minutes" INTEGER NOT NULL,
    "focus_skills" TEXT[],
    "plan" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_results" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "estimated_level" "CEFRLevel" NOT NULL,
    "skill_scores" JSONB NOT NULL,
    "answers" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "rollout" INTEGER NOT NULL DEFAULT 100,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "learner_stats_userId_language_code_key" ON "learner_stats"("userId", "language_code");

-- CreateIndex
CREATE INDEX "xp_events_userId_created_at_idx" ON "xp_events"("userId", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "world_environments_slug_key" ON "world_environments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "characters_slug_key" ON "characters"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "stories_slug_key" ON "stories"("slug");

-- CreateIndex
CREATE INDEX "missions_language_code_cefr_level_idx" ON "missions"("language_code", "cefr_level");

-- CreateIndex
CREATE INDEX "missions_environmentId_idx" ON "missions"("environmentId");

-- CreateIndex
CREATE UNIQUE INDEX "missions_language_code_slug_key" ON "missions"("language_code", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "mission_runs_conversationId_key" ON "mission_runs"("conversationId");

-- CreateIndex
CREATE INDEX "mission_runs_userId_status_idx" ON "mission_runs"("userId", "status");

-- CreateIndex
CREATE INDEX "mission_runs_missionId_idx" ON "mission_runs"("missionId");

-- CreateIndex
CREATE INDEX "mistakes_userId_mastery_state_idx" ON "mistakes"("userId", "mastery_state");

-- CreateIndex
CREATE UNIQUE INDEX "mistakes_userId_language_code_key_key" ON "mistakes"("userId", "language_code", "key");

-- CreateIndex
CREATE UNIQUE INDEX "dna_snapshots_userId_language_code_day_key" ON "dna_snapshots"("userId", "language_code", "day");

-- CreateIndex
CREATE INDEX "grammar_topics_language_code_cefr_level_idx" ON "grammar_topics"("language_code", "cefr_level");

-- CreateIndex
CREATE UNIQUE INDEX "grammar_topics_language_code_slug_key" ON "grammar_topics"("language_code", "slug");

-- CreateIndex
CREATE INDEX "practice_exercises_language_code_cefr_level_idx" ON "practice_exercises"("language_code", "cefr_level");

-- CreateIndex
CREATE INDEX "practice_exercises_grammarTopicId_idx" ON "practice_exercises"("grammarTopicId");

-- CreateIndex
CREATE INDEX "practice_attempts_userId_exerciseId_idx" ON "practice_attempts"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "practice_sessions_userId_mode_created_at_idx" ON "practice_sessions"("userId", "mode", "created_at");

-- CreateIndex
CREATE INDEX "review_logs_userId_reviewed_at_idx" ON "review_logs"("userId", "reviewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "challenge_templates_language_code_cefr_level_idx" ON "challenge_templates"("language_code", "cefr_level");

-- CreateIndex
CREATE UNIQUE INDEX "daily_challenges_userId_language_code_day_key" ON "daily_challenges"("userId", "language_code", "day");

-- CreateIndex
CREATE INDEX "journal_entries_userId_language_code_created_at_idx" ON "journal_entries"("userId", "language_code", "created_at");

-- CreateIndex
CREATE INDEX "learning_plans_userId_language_code_is_active_idx" ON "learning_plans"("userId", "language_code", "is_active");

-- CreateIndex
CREATE INDEX "placement_results_userId_language_code_idx" ON "placement_results"("userId", "language_code");

-- CreateIndex
CREATE INDEX "courses_language_code_idx" ON "courses"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_levelId_language_code_order_key" ON "courses"("levelId", "language_code", "order");

-- CreateIndex
CREATE INDEX "vocabulary_language_code_level_idx" ON "vocabulary"("language_code", "level");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_language_code_normalized_word_level_key" ON "vocabulary"("language_code", "normalized_word", "level");

-- AddForeignKey
ALTER TABLE "learner_stats" ADD CONSTRAINT "learner_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "world_environments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "world_environments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_runs" ADD CONSTRAINT "mission_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_runs" ADD CONSTRAINT "mission_runs_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_runs" ADD CONSTRAINT "mission_runs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dna_scores" ADD CONSTRAINT "dna_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_progress" ADD CONSTRAINT "grammar_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_progress" ADD CONSTRAINT "grammar_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "grammar_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_exercises" ADD CONSTRAINT "practice_exercises_grammarTopicId_fkey" FOREIGN KEY ("grammarTopicId") REFERENCES "grammar_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "practice_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_plans" ADD CONSTRAINT "learning_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_results" ADD CONSTRAINT "placement_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

