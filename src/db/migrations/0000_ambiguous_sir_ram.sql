CREATE TABLE `music_cadences` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`roman_pattern` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `music_cadences_slug_unique` ON `music_cadences` (`slug`);--> statement-breakpoint
CREATE TABLE `music_modes` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`parent_scale` text NOT NULL,
	`intervals` text NOT NULL,
	`characteristic_notes` text NOT NULL,
	`mood` text,
	`common_genres` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `music_modes_slug_unique` ON `music_modes` (`slug`);--> statement-breakpoint
CREATE TABLE `music_progressions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`roman_numerals` text NOT NULL,
	`example_keys` text NOT NULL,
	`genres` text NOT NULL,
	`era` text,
	`moods` text NOT NULL,
	`attribution` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `music_progressions_slug_unique` ON `music_progressions` (`slug`);--> statement-breakpoint
CREATE TABLE `music_voicings` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`chord_quality` text NOT NULL,
	`name` text NOT NULL,
	`notes_template` text NOT NULL,
	`instrument` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `music_voicings_slug_unique` ON `music_voicings` (`slug`);