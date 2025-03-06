"use client";
import SubaccountDetails from "@/components/forms/SubaccountDetails";
import CustomModal from "@/components/global/CustomModal";
import { Button } from "@/components/ui/button";
import { useModalContext } from "@/providers/ModalProvider";
import { Agency, AgencySidebarOption, SubAccount, User } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  user: User & {
    Agency:
      | Agency
      | (null & {
          SubAccount: SubAccount[];
          SideBarOption: AgencySidebarOption[];
        })
      | null;
  };
  id: string;
  className?: string;
};

const CreateSubAccountButton = ({ id, className, user }: Props) => {
  const { setOpen } = useModalContext();
  const agencyDetails = user.Agency;

  if (!agencyDetails) return;
  return (
    <Button
      className={twMerge("w-full flex gap-3", className)}
      onClick={() => {
        {
          setOpen(
            <CustomModal
              defaultOpen={false}
              title="Create Sub Account"
              subHeading="You can switch between sub accounts from the sidebar"
            >
              <SubaccountDetails
                userId={user.id}
                agencyDetails={agencyDetails}
                data={{}}
                userName={user.name}
              />
            </CustomModal>
          );
        }
      }}
    >
      <PlusCircle size={17} />
      Create Sub Account
    </Button>
  );
};

export default CreateSubAccountButton;
