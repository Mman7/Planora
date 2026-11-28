ALTER TABLE `phases` ADD `is_on_hold` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `task_dependencies_pair_idx` ON `task_dependencies` (`task_id`,`depends_on_task_id`);