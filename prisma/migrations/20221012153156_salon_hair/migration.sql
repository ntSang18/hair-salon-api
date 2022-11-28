-- CreateTable
CREATE TABLE `RefreshTokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `refreshToken` VARCHAR(1000) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `managerId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Staffs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `imagePath` VARCHAR(191) NULL,
    `birthday` DATETIME(3) NULL,
    `gender` BOOLEAN NULL DEFAULT false,
    `description` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `roleId` INTEGER NOT NULL,
    `departmentId` INTEGER NOT NULL,

    UNIQUE INDEX `Staffs_phone_key`(`phone`),
    INDEX `Staffs_departmentId_fkey`(`departmentId`),
    INDEX `Staffs_roleId_fkey`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerTypes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `percent` INTEGER NULL,
    `description` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `imagePath` VARCHAR(191) NULL,
    `isCustomerCreated` BOOLEAN NOT NULL DEFAULT false,
    `point` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customerTypeId` INTEGER NOT NULL,
    `birthday` DATETIME(3) NULL,
    `gender` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `Customers_phone_key`(`phone`),
    INDEX `Customers_customerTypeId_fkey`(`customerTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rate` INTEGER NULL,
    `comment` VARCHAR(1000) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `staffId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,

    INDEX `Rates_customerId_fkey`(`customerId`),
    INDEX `Rates_staffId_fkey`(`staffId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NULL,
    `timeSlot` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NULL,
    `staffId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,

    INDEX `Bookings_customerId_fkey`(`customerId`),
    INDEX `Bookings_staffId_fkey`(`staffId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quanlity` INTEGER NULL,
    `price` INTEGER NULL,
    `bookingId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `billId` INTEGER NOT NULL,

    INDEX `Details_billId_fkey`(`billId`),
    INDEX `Details_bookingId_fkey`(`bookingId`),
    INDEX `Details_serviceId_fkey`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NULL,
    `staffId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,

    INDEX `Bills_customerId_fkey`(`customerId`),
    INDEX `Bills_staffId_fkey`(`staffId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceTypes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `description` VARCHAR(1000) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` INTEGER NULL,
    `name` VARCHAR(191) NULL,
    `imagePath` VARCHAR(191) NULL,
    `serviceTypeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Services_serviceTypeId_fkey`(`serviceTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Staffs` ADD CONSTRAINT `Staffs_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Staffs` ADD CONSTRAINT `Staffs_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customers` ADD CONSTRAINT `Customers_customerTypeId_fkey` FOREIGN KEY (`customerTypeId`) REFERENCES `CustomerTypes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rates` ADD CONSTRAINT `Rates_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rates` ADD CONSTRAINT `Rates_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staffs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookings` ADD CONSTRAINT `Bookings_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookings` ADD CONSTRAINT `Bookings_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Details` ADD CONSTRAINT `Details_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bills`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Details` ADD CONSTRAINT `Details_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Details` ADD CONSTRAINT `Details_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bills` ADD CONSTRAINT `Bills_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bills` ADD CONSTRAINT `Bills_id_fkey` FOREIGN KEY (`id`) REFERENCES `Bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bills` ADD CONSTRAINT `Bills_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staffs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Services` ADD CONSTRAINT `Services_serviceTypeId_fkey` FOREIGN KEY (`serviceTypeId`) REFERENCES `ServiceTypes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
