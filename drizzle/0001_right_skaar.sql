CREATE TABLE "note_shares" (
	"note_id" uuid PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"tags" text[] NOT NULL,
	"note_created_at" timestamp with time zone NOT NULL,
	"note_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "note_shares_token_idx" ON "note_shares" USING btree ("token");