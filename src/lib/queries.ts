"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import db from "./db";
import { redirect } from "next/navigation";
import { Agency, Plan, SubAccount, User } from "@prisma/client";
import { v4 } from "uuid";

export const getAuthUserDetails = async () => {
  const user = await currentUser();

  if (!user) return;

  const userData = db.user.findFirst({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOptions: true,
          SubAccounts: {
            include: {
              sidebarOptions: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });
  return userData;
};

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subAccountId,
}: {
  agencyId?: string | undefined;
  description: string;
  subAccountId: string | undefined;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccounts: {
            some: {
              id: subAccountId,
            },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findFirst({
      where: { email: authUser.emailAddresses[0].emailAddress },
    });
  }

  if (!userData) {
    console.log("NO user found");
    return;
  }

  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subAccountId) {
      throw new Error(
        "You need to provide at least one of agencyId or subAccountId"
      );
      return;
    }
    const subAccount = await db.subAccount.findFirst({
      where: {
        id: subAccountId,
      },
    });
    if (subAccount) foundAgencyId = subAccount.agencyId;
  }
  if (subAccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        user: {
          connect: {
            id: userData.id,
          },
        },
        agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        subAccount: {
          connect: {
            id: subAccountId,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        user: {
          connect: {
            id: userData.id,
          },
        },
        agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

export const createTeamuser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;
  const newuser = await db.user.create({
    data: { ...user },
  });
  return newuser;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const invitationExists = await db.invitation.findFirst({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });
  if (invitationExists) {
    const userDetails = await createTeamuser(invitationExists.agencyId, {
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: user.id,
    });

    await saveActivityLogsNotification({
      agencyId: invitationExists.agencyId,
      description: "Invitation accepted",
      subAccountId: undefined,
    });

    if (userDetails) {
      await clerkClient.users.updateUser(user.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });
      await db.invitation.delete({
        where: {
          id: invitationExists.id,
        },
      });
      return userDetails.agencyId;
    } else {
      return null;
    }
  } else {
    const agency = await db.user.findFirst({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return agency ? agency.agencyId : null;
  }
};

export const updatedAgencyDetails = async (
  agencyId: string,
  agencyDetail: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetail },
  });
  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: { id: agencyId },
  });
  return response;
};

export const initUser = async (newUser: Partial<User>) => {
  console.log(initUser);
  const user = await currentUser();
  if (!user) return;
  try {
    const response = await db.user.upsert({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
      update: newUser,
      create: {
        name: user.firstName + " " + user.lastName,
        email: user.emailAddresses[0].emailAddress,
        avatarUrl: user.imageUrl,
        role: newUser.role || "SUBACCOUNT_USER",
      },
    });

    // const client = await clerkClient();
    // await client.users.updateUser(user.id, {
    //   privateMetadata: {
    //     role: response.role || "SUBACCOUNT_USER",
    //   },
    // });
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const upsertAgency = async (agency: Partial<Agency>, price?: Plan) => {
  if (!agency.companyEmail) return null;

  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency?.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency?.companyEmail },
        },
        ...agency,
        name: agency.name ?? "",
        SidebarOptions: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ].filter((option) => option.name),
        },
      },
    });
    console.log(agencyDetails);
    return agencyDetails;
  } catch (error) {
    console.log(error);
  }
};

export const getAllNotifications = async (agencyId: string) => {
  try {
    const notis = await db.notification.findMany({
      where: {
        agencyId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return notis;
  } catch (e) {
    console.log(e);
  }
};

export const upsertSubAccount = async (
  subAccountDetails: Partial<SubAccount>
) => {
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccountDetails.agencyId,
      },
      role: "AGENCY_OWNER",
    },
  });
  console.log(subAccountDetails);
  if (!agencyOwner) throw new Error("Your are not a agency owner.");
  const permissionId = v4();
  const response = await db.subAccount.upsert({
    where: {
      id: subAccountDetails.id,
    },
    update: subAccountDetails,
    create: {
      ...subAccountDetails,
      permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          id: permissionId,
          subAccountId: subAccountDetails.id,
        },
      },
      pipelines: {
        create: [
          {
            name: "Lead Cycle",
          },
        ],
      },
      sidebarOptions: {
        create: [
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/subaccount/${subAccountDetails.id}/launchpad`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/subaccount/${subAccountDetails.id}/settings`,
          },
          {
            name: "Funnels",
            icon: "pipelines",
            link: `/subaccount/${subAccountDetails.id}/funnels`,
          },
          {
            name: "Media",
            icon: "database",
            link: `/subaccount/${subAccountDetails.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/subaccount/${subAccountDetails.id}/automations`,
          },
          {
            name: "Pipelines",
            icon: "flag",
            link: `/subaccount/${subAccountDetails.id}/pipelines`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/subaccount/${subAccountDetails.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/subaccount/${subAccountDetails.id}`,
          },
        ],
      },
    },
  });
  return response;
};

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      Permissions: {
        include: {
          subAccount: true,
        },
      },
    },
  });
  return response;
};

export const updateUser = async (user: Partial<User>) => {
  try {
    const response = await db.user.update({
      where: { email: user.email },
      data: { ...user },
    });

    await clerkClient.users.updateUser(user.id, {
      privateMetaData: {
        role: user.role || "SUBACCOUNT_USER",
      },
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const updateUserPermission = async (
  permissionId: string,
  email: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permission.upsert({
      where: {
        id: permissionId,
      },
      update: {
        access: permission,
      },
      create: {
        access: permission,
        email,
        subAccountId,
      },
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const getSubAccountDetails = async (subAccountId: string) => {
  try {
    const subAccountDetails = await db.subAccount.findUnique({
      where: { id: subAccountId },
    });
    return subAccountDetails;
  } catch (e) {
    console.log(e);
  }
};

export const deleteSubAccount = async (subAccountId: string) => {
  try {
    const response = await db.subAccount.delete({
      where: {
        id: subAccountId,
      },
    });
    return response;
  } catch (e) {
    console.log(e);
  }
};
