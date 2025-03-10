"use client";
import { useToast } from "@/hooks/use-toast";
import {
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
  updateUserPermission,
} from "@/lib/queries";
import {
  AuthUserWithAgencySidebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from "@/lib/types";
import { useModalContext } from "@/providers/ModalProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubAccount, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import FileUpload from "../global/FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { v4 } from "uuid";

type props = {
  type: "agency" | "subaccount";
  id: string | null;
  subAccounts: SubAccount[];
  userData: Partial<User> | null;
};

const UserDetails = ({ type, id, subAccounts, userData }: props) => {
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsAndSubAccounts>(null);
  const { data, setClose } = useModalContext();
  const [roleState, setRoleState] = useState("");
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySidebarOptionsSubAccounts | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  console.log(data);

  const onChangePermission = async (
    subAccountId: string,
    permission: boolean,
    permissionId: string | undefined
  ) => {
    if (!data.user?.email) return;
    setLoadingPermissions(true);
    const response = await updateUserPermission(
      permissionId ? permissionId : v4(),
      data.user.email,
      subAccountId,
      permission
    );

    if (type == "agency") {
      await saveActivityLogsNotification({
        agencyId: authUserData?.Agency?.id,
        description: `Give ${userData?.name} access to | ${
          subAccountPermissions?.Permissions.find(
            (permission) => permission.subAccountId == subAccountId
          )?.subAccount.name
        }`,
        subAccountId: subAccountPermissions?.Permissions.find(
          (permission) => permission.subAccountId == subAccountId
        )?.subAccount.id,
      });
    }

    if (response) {
      toast({
        title: "Success",
        description: "Updated User Permission",
      });
      if (subAccountPermissions) {
        setSubAccountPermissions({
          ...subAccountPermissions,
          Permissions: subAccountPermissions.Permissions.map((p) => {
            if (p.subAccountId == subAccountId) {
              return {
                ...p,
                access: permission,
              };
            }
            return p;
          }),
        });
      }
    } else {
      toast({
        title: "Opps!!",
        variant: "destructive",
        description: "Can't update user permission",
      });
    }
    router.refresh();
    setLoadingPermissions(false);
  };

  useEffect(() => {
    if (data.user) {
      const fetchUser = async () => {
        const response = await getAuthUserDetails();
        if (response) {
          setAuthUserData(response);
        }
      };
      fetchUser();
    }
  }, [data]);

  const userDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum([
      "AGENCY_ADMIN",
      "AGENCY_OWNER",
      "SUBACCOUNT_USER",
      "SUBACCOUNT_GUEST",
    ]),
  });

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: "onChange",
    defaultValues: {
      name: userData ? userData?.name : data.user?.name,
      email: userData ? userData?.email : data.user?.email,
      avatarUrl: userData ? userData?.avatarUrl : data.user?.avatarUrl,
      role: userData ? userData?.role : data.user?.role,
    },
  });

  useEffect(() => {
    if (!data.user) return;
    const getPermissions = async () => {
      const permissions = await getUserPermissions(data.user?.id as string);
      if (permissions) setSubAccountPermissions(permissions);
    };
    getPermissions();
  }, [data, form]);

  useEffect(() => {
    if (data.user) {
      form.reset(data.user);
    }
    if (userData) {
      form.reset(userData);
    }
  }, [userData, data]);

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return;
    if (userData || data.user) {
      const updatedUser = await updateUser(values);

      authUserData?.Agency?.SubAccounts.filter((subacc) => {
        authUserData.Permissions.find(
          (p) => p.subAccountId == subacc.id && p.access
        );
      }).forEach(async (subAcc) => {
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Updated ${userData?.name} information`,
          subAccountId: subAcc.id,
        });
      });
      if (updatedUser) {
        toast({
          title: "Success",
          description: "Updated User Information",
        });
        setClose();
        router.refresh();
      } else {
        toast({
          title: "Opps!!",
          variant: "destructive",
          description: "Can't update user information",
        });
      }
    } else {
      console.log("Error can't submit");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or Update User information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      disabled={field.value == "AGENCY_OWNER"}
                      onValueChange={(value) => {
                        if (
                          value == "SUBACCOUNT_USER" ||
                          value == "SUBACCOUNT_GUEST"
                        ) {
                          setRoleState(
                            "You need to have subaccounts to assign subaccount access to team members."
                          );
                        } else {
                          setRoleState("");
                        }

                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AGENCY_ADMIN">
                          Agency Admin
                        </SelectItem>
                        {(userData?.role == "AGENCY_OWNER" ||
                          data?.user?.role == "AGENCY_OWNER") && (
                          <SelectItem value="AGENCY_OWNER">
                            Agency Owner
                          </SelectItem>
                        )}
                        <SelectItem value="SUBACCOUNT_USER">
                          Subaccount user
                        </SelectItem>
                        <SelectItem value="SUBACCOUNT_GUEST">
                          Subaccount guest
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <p className="text-muted-foreground text-sm">{roleState}</p>
                </FormItem>
              )}
            />
            <Button>
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save user information"
              )}
            </Button>
            {authUserData?.role == "AGENCY_OWNER" && (
              <div>
                <Separator className="my-4" />
                <FormLabel>User Permissions</FormLabel>
                <FormDescription>
                  You can give sub account access to team members by turning on
                  access control for each sub account.This is only visible to
                  agency owners.
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionDetails =
                      subAccountPermissions?.Permissions.find(
                        (p) => p.subAccountId == subAccount.id
                      );
                    return (
                      <div
                        key={subAccount.id}
                        className="flex  justify-between items-center rounded-lg border p-4"
                      >
                        <div>
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionDetails?.access}
                          onCheckedChange={(permission) => {
                            onChangePermission(
                              subAccount.id,
                              permission,
                              subAccountPermissionDetails?.id
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
