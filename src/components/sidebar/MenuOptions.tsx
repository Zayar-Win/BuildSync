"use client";
import {
  Agency,
  AgencySidebarOption,
  SubAccount,
  SubAccountSidebarOption,
  User,
} from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { ChevronsUpDown, Compass, Menu, PlusCircle } from "lucide-react";
import clsx from "clsx";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { useModalContext } from "@/providers/ModalProvider";
import CustomModal from "../global/CustomModal";
import SubaccountDetails from "../forms/SubaccountDetails";
import { icons } from "@/lib/constant";

type Props = {
  defaultOpen?: boolean;
  subAccounts: SubAccount[];
  sidebarOptions: AgencySidebarOption[] | SubAccountSidebarOption[];
  sidebarLogo: string;
  details: Agency | SubAccount;
  user: User;
  id: string;
};

const MenuOptions = ({
  details,
  id,
  sidebarLogo,
  sidebarOptions,
  subAccounts,
  user,
  defaultOpen,
}: Props) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );
  const { setOpen } = useModalContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;
  return (
    <div>
      <Sheet modal={false} {...openState}>
        <SheetTrigger className="absolute left-4 top-4 z-[100] md:hidden flex">
          <div className="bg-primary px-3 py-3 rounded-lg text-white">
            <Menu />
          </div>
        </SheetTrigger>
        <SheetContent
          showX={!defaultOpen}
          side={"left"}
          className={clsx(
            "bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6",
            { "hidden md:inline-block z-0 w-[300px] ": defaultOpen },
            { "inline-block md:hidden z-[100] w-full": !defaultOpen }
          )}
        >
          <SheetTitle className="hidden"></SheetTitle>
          <div>
            <AspectRatio ratio={16 / 5}>
              <Image
                src={sidebarLogo}
                alt="Sidebar Logo"
                fill
                className="rounded-lg object-cover"
              />
            </AspectRatio>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"ghost"}
                className="w-full my-4 flex items-center justify-between py-8"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col ">
                    {details.name}
                    <span className="text-muted-foreground">
                      {details.address}
                    </span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command>
                <CommandInput
                  placeholder="Search"
                  className="border-none !outline-none !ring-0"
                />
                <CommandList className="pb-16">
                  <CommandEmpty>No results found.</CommandEmpty>
                  {(user.role == "AGENCY_ADMIN" ||
                    user.role == "AGENCY_OWNER") && (
                    <CommandGroup heading="Agency">
                      <CommandItem className="!bg-transparent w-full h-full flex my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                        {defaultOpen ? (
                          <Link
                            href={`/agency/${user?.Agency?.id}`}
                            className="flex gap-4 w-full h-full"
                          >
                            <div className="relative w-16 ">
                              <Image
                                src={user?.Agency?.agencyLogo}
                                alt="agencyLogo"
                                fill
                                className="rounded-md w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex  flex-col flex-1 items-start">
                              <span className="!text-black">
                                {user?.Agency?.name}
                              </span>
                              <span className="text-muted-foreground">
                                {user?.Agency?.address}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <SheetClose asChild>
                            <Link
                              href={`/agency/${user?.Agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="agencyLogo"
                                  fill
                                  className="rounded-md w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <span className="text-black">
                                  {user?.Agency?.name}
                                </span>
                                <span className="text-muted-foreground">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          </SheetClose>
                        )}
                      </CommandItem>
                    </CommandGroup>
                  )}
                  <CommandGroup heading="Accounts">
                    {subAccounts.length ? (
                      subAccounts.map((subAccount) => (
                        <CommandItem
                          key={subAccount.id}
                          className="!bg-transparent w-full h-full flex my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all"
                        >
                          {defaultOpen ? (
                            <Link
                              href={`/subaccount/${subAccount.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16 ">
                                <Image
                                  src={subAccount?.agencyLogo}
                                  alt="agencyLogo"
                                  fill
                                  className="rounded-md w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col flex-1 items-start">
                                {subAccount?.name}
                                <span className="text-muted-foreground">
                                  {subAccount?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/subaccount/${subAccount.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={subAccount?.agencyLogo}
                                    alt="agencyLogo"
                                    fill
                                    className="rounded-md w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {subAccount?.name}
                                  <span className="text-muted-foreground">
                                    {subAccount?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      ))
                    ) : (
                      <p className="text-xs px-2 text-foreground">
                        No Accounts
                      </p>
                    )}
                  </CommandGroup>
                </CommandList>
                {(user?.role == "AGENCY_ADMIN" ||
                  user?.role == "AGENCY_OWNER") && (
                  <Button
                    onClick={() => {
                      setOpen(
                        <CustomModal
                          title="Create A Subaccount"
                          defaultOpen={false}
                          subHeading="You can switch between your agency account and the subaccount from the sidebar."
                        >
                          <SubaccountDetails data={{}} />
                        </CustomModal>
                      );
                    }}
                  >
                    <PlusCircle size={16} />
                    Create Sub Account
                  </Button>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2">Menu Links</p>
          <Separator className="mb-4" />
          <nav className="relative">
            <Command className="bg-transparent overflow-visible">
              <CommandInput
                placeholder="search"
                className="border-none !outline-none !ring-0"
              />
              <CommandList className="pb-4 overflow-visible">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Menu" className="!overflow-visible">
                  {sidebarOptions.map((option) => {
                    let val;
                    const result = icons.find(
                      (icon) => icon.value == option.icon
                    );
                    if (result) {
                      val = <result.path />;
                    }
                    return (
                      <CommandItem
                        key={option.id}
                        className="md:w-[320px]  w-full"
                      >
                        <Link
                          href={option.link}
                          className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all md:w-full w-[320px]"
                        >
                          {val}
                          <span>{option.name}</span>
                        </Link>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuOptions;
