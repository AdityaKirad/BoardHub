ALTER TABLE `list` ADD `pinned` integer DEFAULT false NOT NULL;
--> statement-breakpoint;
ALTER TABLE `card` ADD `archived` integer DEFAULT false NOT NULL;