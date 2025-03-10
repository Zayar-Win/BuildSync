import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import DataTable from "./data-table";
import { Plus } from "lucide-react";
import { columns } from "./columns";
import SendInvitation from "@/components/forms/SendInvitation";

type Props = {
  params: Promise<{
    agencyId: string;
  }>;
};

const Team = async ({ params }: Props) => {
  const { agencyId } = await params;
  const authUser = await currentUser();
  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: agencyId,
      },
    },
    include: {
      Agency: { include: { SubAccounts: true } },
      Permissions: { include: { subAccount: true } },
    },
  });

  if (!authUser) return;

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: agencyId,
    },
    include: {
      SubAccounts: true,
    },
  });

  if (!agencyDetails) return;

  return (
    <DataTable
      columns={columns}
      data={teamMembers}
      filterValue="name"
      actionButtonText={
        <>
          <Plus />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={agencyId} />}
    ></DataTable>
  );
};

export default Team;
