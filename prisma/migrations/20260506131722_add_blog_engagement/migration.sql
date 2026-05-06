-- AlterTable
ALTER TABLE `BlogPost` ADD COLUMN `giscusEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `likeCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `BlogPostLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `ipHash` VARCHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BlogPostLike_postId_idx`(`postId`),
    UNIQUE INDEX `BlogPostLike_postId_ipHash_key`(`postId`, `ipHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlogPostLike` ADD CONSTRAINT `BlogPostLike_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
