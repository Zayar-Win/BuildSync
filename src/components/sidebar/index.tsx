import { getAuthUserDetails } from "@/lib/queries";
import React from "react";
import MenuOptions from "./MenuOptions";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();

  if (!user) return null;

  if (!user.Agency) return null;

  const details =
    type == "agency"
      ? user.Agency
      : user.Agency.SubAccounts.find((subAccount) => subAccount.id === id);

  if (!details) return null;

  const isWhiteLabeledAgency = user.Agency.whiteLabel;

  let sidebarLogo = user.Agency.agencyLogo;

  if (!isWhiteLabeledAgency) {
    if (type == "subaccount") {
      sidebarLogo =
        user?.Agency.SubAccounts.find((subAccount) => subAccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  const sidebarOptions =
    type == "agency"
      ? user.Agency.SidebarOptions || []
      : user.Agency.SubAccounts.find((subAccount) => subAccount.id === id)
          ?.sidebarOptions || [];

  const subAccounts = user.Agency.SubAccounts.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  return (
    <div>
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        sidebarOptions={sidebarOptions}
        subAccounts={subAccounts}
        user={user}
        defaultOpen={false}
      />
    </div>
  );
};

export default Sidebar;
