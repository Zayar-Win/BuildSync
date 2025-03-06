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
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getAuthUserDetails } from "@/lib/queries";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import DeleteButton from "../_components/DeleteButton";
import CreateSubAccountButton from "../_components/CreateSubAccountButton";

const Page = async ({ params }: { params: Promise<{ agencyId: string }> }) => {
  const user = await getAuthUserDetails();
  const { agencyId } = await params;

  if (!user) return;

  return (
    <AlertDialog>
      <div className="flex flex-col">
        <div className="w-full flex justify-end">
          <CreateSubAccountButton
            id={agencyId}
            user={user}
            className="w-[200px]  m-6"
          />
        </div>
        <Command>
          <CommandInput
            className="border-none !outline-none !ring-0"
            placeholder="Search sub account..."
          />
          <CommandList>
            <CommandEmpty>No sub accounts found</CommandEmpty>
            <CommandGroup heading="All subaccounts">
              {!!user?.Agency?.SubAccounts.length ? (
                user?.Agency?.SubAccounts.map((subAccount) => (
                  <CommandItem
                    key={subAccount.id}
                    className="h-32 !bg-background my-2 text-primary-border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
                  >
                    <Link
                      href={`/subaccount/${subAccount.id}`}
                      className="flex gap-4 w-full h-full"
                    >
                      <div className="relative w-32">
                        <Image
                          src={subAccount?.subAccountLogo}
                          alt="Sub account logo"
                          width={100}
                          height={100}
                          className="rounded-md object-contain p-4 bg-muted/50"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col text-foreground">
                          {subAccount.name}
                          <span className="text-muted-foreground text-xs">
                            {subAccount.address}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <AlertDialogTrigger asChild>
                      <Button
                        className=" text-white w-20 hover:bg-red-600 hover:text-white"
                        variant={"destructive"}
                        size={"sm"}
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                          Are You sure you want to delete this sub account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.This will delete sub
                          account and all data related to this subaccount.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel className="mb-2">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:!text-black hover:bg-destructive-foreground">
                          <DeleteButton subAccountId={subAccount.id} />
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </CommandItem>
                ))
              ) : (
                <p className="text-muted-foreground p-4 text-center">
                  No sub accounts found
                </p>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </AlertDialog>
  );
};

export default Page;
