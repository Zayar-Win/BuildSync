import { Notification, Prisma, Role } from "@prisma/client";
import { getAuthUserDetails, getUserPermissions } from "./queries";
import db from "./db";

export type NotificationWithUser =
  | ({
      user: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
        agencyId: string;
      };
    } & Notification)[]
  | undefined;

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>;

export type AuthUserWithAgencySidebarOptionsSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>;

export const _getUsersWithAgencySubAccountPermissionsSidebarOptions = async (
  agencyId: string
) => {
  return await db.user.findFirst({
    where: {
      Agency: { id: agencyId },
    },
    include: {
      Agency: { include: { SubAccounts: true } },
      Permissions: { include: { subAccount: true } },
    },
  });
};

export type UsersWithAgencySubAccountPermissionsSidebarOptions =
  Prisma.PromiseReturnType<
    typeof _getUsersWithAgencySubAccountPermissionsSidebarOptions
  >;
