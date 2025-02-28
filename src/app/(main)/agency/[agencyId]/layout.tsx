import BlurPage from "@/components/global/BlurPage";
import Infobar from "@/components/global/Infobar";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/Unauthorized";
import { getAllNotifications, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: { agencyId: string };
  children: React.ReactNode;
};

const layout = async ({ children }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user) {
    return redirect("/");
  }

  if (!agencyId) {
    return redirect("/agency");
  }

  console.log(user);

  if (
    user.privateMetadata?.role !== "AGENCY_ADMIN" &&
    user.privateMetadata?.role !== "AGENCY_OWNER"
  )
    return <Unauthorized />;

  let allNotis: any[] = [];

  const notis = await getAllNotifications(agencyId);

  if (notis) allNotis = notis;

  return (
    <div>
      <Sidebar id={agencyId} type="agency" />
      <div className="md:pl-[300px]">
        <Infobar notifications={allNotis} role={user.privateMetadata.role} />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;
