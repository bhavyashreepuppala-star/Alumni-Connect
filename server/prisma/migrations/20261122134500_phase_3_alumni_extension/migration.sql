-- AlterTable
ALTER TABLE `alumniprofile` ADD COLUMN `collegeName` VARCHAR(191) NULL DEFAULT 'Alumni Connect University',
    ADD COLUMN `rollNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `alumniverification` MODIFY `documentType` VARCHAR(191) NOT NULL DEFAULT 'DEGREE_CERTIFICATE',
    MODIFY `documentUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `AlumniProfile_rollNumber_key` ON `AlumniProfile`(`rollNumber`);

-- CreateIndex
CREATE INDEX `AlumniProfile_rollNumber_idx` ON `AlumniProfile`(`rollNumber`);
