ALTER TABLE `board` ALTER COLUMN "background" TO "background" text NOT NULL DEFAULT 'var(--board-default)';
--> statement-breakpoint
ALTER TABLE `board` ADD `archived` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `list` ALTER COLUMN "color" TO "color" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `list` ADD `collapsed` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `list` ADD `pinned` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `card` ADD `cover` text DEFAULT '{"background":"","size":"full"}' NOT NULL;
--> statement-breakpoint
ALTER TABLE `card` ADD `archived` integer DEFAULT false NOT NULL;