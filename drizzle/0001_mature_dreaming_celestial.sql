CREATE TABLE "story_generation_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"scenario_id" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"locked_at" timestamp with time zone,
	"locked_by" text,
	"last_error" text,
	"last_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "story_generation_jobs_scenario_id_unique" UNIQUE("scenario_id")
);
--> statement-breakpoint
CREATE INDEX "story_generation_jobs_status_idx" ON "story_generation_jobs" USING btree ("status");