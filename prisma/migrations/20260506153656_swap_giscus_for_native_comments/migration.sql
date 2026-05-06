-- Rename giscusEnabled → commentsEnabled (préserve les valeurs booléennes existantes)
ALTER TABLE `BlogPost` CHANGE COLUMN `giscusEnabled` `commentsEnabled` BOOLEAN NOT NULL DEFAULT true;

-- Création de la table des commentaires anonymes avec modération
CREATE TABLE `BlogComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `pseudo` VARCHAR(80) NOT NULL,
    `message` TEXT NOT NULL,
    `email` VARCHAR(160) NULL,
    `ipHash` VARCHAR(64) NOT NULL,
    `userAgent` TEXT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BlogComment_postId_status_idx`(`postId`, `status`),
    INDEX `BlogComment_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `BlogComment`
    ADD CONSTRAINT `BlogComment_postId_fkey`
    FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
