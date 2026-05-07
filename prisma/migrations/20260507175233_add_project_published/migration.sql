-- AlterTable
ALTER TABLE `Project` ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX `Project_published_publishedAt_idx` ON `Project`(`published`, `publishedAt`);
