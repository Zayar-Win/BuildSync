import AgencyDetails from "@/components/forms/AgencyDetails";
import UserDetails from "@/components/forms/UserDetails";
import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

type props = {
  params: { agencyId: string };
};

const Settings = async ({ params }: props) => {
  const { agencyId } = await params;
  const authUser = await currentUser();

  if (!authUser) return null;

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser?.emailAddresses[0].emailAddress,
    },
  });

  if (!userDetails) return null;

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: {
      SubAccounts: true,
    },
  });

  if (!agencyDetails) return null;

  const subAccounts = agencyDetails.SubAccounts;

  return (
    <div className="flex lg:!flex-row flex-col gap-4">
      <AgencyDetails data={agencyDetails} />
      <UserDetails
        type="agency"
        id={params.agencyId}
        userData={userDetails}
        subAccounts={subAccounts}
      />
    </div>
  );
};

export default Settings;
