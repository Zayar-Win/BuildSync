"use client";
import UserDetails from "@/components/forms/UserDetails";
import CustomModal from "@/components/global/CustomModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteUser, getUser } from "@/lib/queries";
import { UsersWithAgencySubAccountPermissionsSidebarOptions } from "@/lib/types";
import { useModalContext } from "@/providers/ModalProvider";
import { Role, SubAccount } from "@prisma/client";
import { useRouter } from "next/navigation";

import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import Image from "next/image";

export const columns: ColumnDef<UsersWithAgencySubAccountPermissionsSidebarOptions>[] =
  [
    {
      accessorKey: "id",
      header: "",
      cell: () => {
        return null;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const avatarUrl = row.getValue("avatarUrl") as string;
        return (
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 relative flex-none">
              <Image
                src={avatarUrl}
                fill
                className="rounded-full object-cover"
                alt="Avatar"
              />
            </div>
            <span>{row.getValue("name")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "avatarUrl",
      header: "",
      cell: () => {
        return null;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "SubAccount",
      header: "Owned Subaccounts",
      cell: ({ row }) => {
        const isAgencyOwner = row.getValue("role") == "AGENCY_OWNER";
        const ownedAccounts = row.original?.Permissions?.filter(
          (per) => per.access
        );

        if (isAgencyOwner) {
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              <Badge className="bg-slate-600 whitespace-nowrap">
                Agency - {row?.original?.Agency?.name}
              </Badge>
            </div>
          </div>;
        }
        return (
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              {ownedAccounts?.length ? (
                ownedAccounts?.map((ownAccount) => (
                  <Badge
                    className="bg-slate-600 w-fit whitespace-nowrap"
                    key={ownAccount?.id}
                  >
                    SubAccount - {ownAccount?.subAccount?.name}
                  </Badge>
                ))
              ) : (
                <div className="text-muted-foreground">No Access Yet</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role: Role = row.getValue("role");
        return (
          <Badge
            className={clsx({
              "bg-emerald-500": role == "AGENCY_OWNER",
              "bg-orange-400": role == "AGENCY_ADMIN",
              "bg-primary": role == "SUBACCOUNT_USER",
              "bg-muted": role == "SUBACCOUNT_GUEST",
            })}
          >
            {role}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const rowData = row.original;

        return <CellActions rowData={rowData} />;
      },
    },
  ];

interface CellActionsProps {
  rowData: UsersWithAgencySubAccountPermissionsSidebarOptions;
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const { setOpen } = useModalContext();
  const router = useRouter();
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} className="h-8 w-8 p-0">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() =>
              navigator.clipboard.writeText(rowData?.email as string)
            }
          >
            <Copy size={15} /> Copy Mail
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal
                  defaultOpen={false}
                  title="Edit User Detail"
                  subHeading="You can change permissions only when the user has an owned subaccount."
                >
                  <UserDetails
                    type="agency"
                    id={rowData?.Agency?.id || null}
                    userData={null}
                    subAccounts={rowData?.Agency?.SubAccounts as SubAccount[]}
                  />
                </CustomModal>,
                async () => {
                  return { user: await getUser(rowData?.id as string) };
                }
              );
            }}
          >
            <Edit size={17} />
            Edit User
          </DropdownMenuItem>
          {rowData?.role == "AGENCY_OWNER" && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
              // onClick={async () => await deleteUser(rowData?.id as string)}
              >
                <Trash size={15} /> Remove User
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure you want to delete this user?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            and all the data associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await deleteUser(rowData?.id as string);
              router.refresh();
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
