CREATE SCHEMA "app";
--> statement-breakpoint
CREATE SCHEMA "music";
--> statement-breakpoint
CREATE TABLE "app"."example" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music"."cadences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"roman_pattern" text[] NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "cadences_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "music"."modes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"parent_scale" text NOT NULL,
	"intervals" text[] NOT NULL,
	"characteristic_notes" text[] NOT NULL,
	"mood" text,
	"common_genres" text[] NOT NULL,
	CONSTRAINT "modes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "music"."progressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"roman_numerals" text[] NOT NULL,
	"example_keys" text[] NOT NULL,
	"genres" text[] NOT NULL,
	"era" text,
	"moods" text[] NOT NULL,
	"attribution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "progressions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "music"."voicings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"chord_quality" text NOT NULL,
	"name" text NOT NULL,
	"notes_template" text[] NOT NULL,
	"instrument" text,
	CONSTRAINT "voicings_slug_unique" UNIQUE("slug")
);
