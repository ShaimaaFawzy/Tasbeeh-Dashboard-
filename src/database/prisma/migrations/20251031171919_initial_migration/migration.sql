-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('Active', 'Offline', 'Suspended', 'Deleted');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('Admin', 'Normal');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('Google', 'Apple', 'Facebook');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('Sent', 'Scheduled', 'Draft');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "userName" VARCHAR(200) NOT NULL,
    "password" TEXT NOT NULL,
    "salt" VARCHAR(50) NOT NULL,
    "email" VARCHAR(250) NOT NULL,
    "mobile" VARCHAR(20),
    "logo" TEXT,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'Active',
    "region" VARCHAR(50),
    "userType" "UserType" NOT NULL DEFAULT 'Normal',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_social_logins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "verifiedPrivateEmail" BOOLEAN NOT NULL,
    "rawProfileJson" VARCHAR(2000) NOT NULL,
    "accessTokenEncrypted" VARCHAR(2000) NOT NULL,
    "refreshTokenEncrypted" VARCHAR(2000) NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_social_logins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_details" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feeling" VARCHAR(50) NOT NULL,
    "totalZiker" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL,
    "totalStreak" INTEGER NOT NULL,
    "activeLoginDays" INTEGER NOT NULL,
    "rank" VARCHAR(10) NOT NULL,
    "inviteCode" VARCHAR(30) NOT NULL,
    "friendsInvited" INTEGER NOT NULL,
    "totalZikerByInvitedFriends" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "deviceId" VARCHAR(50) NOT NULL,
    "userId" TEXT NOT NULL,
    "paringDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "deviceStatus" BOOLEAN NOT NULL,
    "lastSync" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceToken" VARCHAR(50) NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notification_messages" (
    "id" TEXT NOT NULL,
    "pushSettingsId" TEXT NOT NULL,
    "messageStatus" "MessageStatus" NOT NULL,
    "messageTitle" VARCHAR(50) NOT NULL,
    "messageLogo" TEXT,
    "messageBody" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3),

    CONSTRAINT "push_notification_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "ipAddress" VARCHAR(30) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "os" VARCHAR(20) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "id" TEXT NOT NULL,
    "groupName" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_groups" (
    "permissionId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT NOT NULL,

    CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("permissionId","groupId")
);

-- CreateTable
CREATE TABLE "user_group_members" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "user_group_members_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_details_userId_key" ON "user_details"("userId");

-- AddForeignKey
ALTER TABLE "user_social_logins" ADD CONSTRAINT "user_social_logins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_details" ADD CONSTRAINT "user_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notification_settings" ADD CONSTRAINT "push_notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notification_messages" ADD CONSTRAINT "push_notification_messages_pushSettingsId_fkey" FOREIGN KEY ("pushSettingsId") REFERENCES "push_notification_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_groups" ADD CONSTRAINT "permission_groups_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_groups" ADD CONSTRAINT "permission_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "user_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_members" ADD CONSTRAINT "user_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_members" ADD CONSTRAINT "user_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "user_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
