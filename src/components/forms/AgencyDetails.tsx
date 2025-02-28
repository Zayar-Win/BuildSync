"use client";
import { Agency } from "@prisma/client";
import React, { useState } from "react";
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
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/global/FileUpload";
import { Switch } from "../ui/switch";
import { NumberInput } from "@tremor/react";
import {
  deleteAgency,
  initUser,
  saveActivityLogsNotification,
  updatedAgencyDetails,
  upsertAgency,
} from "@/lib/queries";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { v4 as uuid4 } from "uuid";

type AgencyDetailsProps = {
  data: Partial<Agency>;
};

const FormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Agency name must be at least 2 characters long" }),
  companyEmail: z.string().email({ message: "Invalid email address" }),
  companyPhone: z
    .string()
    .min(1, { message: "Phone number must be at least 1 characters long" }),
  whiteLabel: z.boolean(),
  address: z
    .string()
    .min(1, { message: "Address must be at least 1 characters long" }),
  zipCode: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  agencyLogo: z.string().min(1),
});

const AgencyDetails = ({ data }: AgencyDetailsProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name ?? "",
      companyEmail: data?.companyEmail ?? "",
      companyPhone: data?.companyPhone ?? "",
      whiteLabel: data?.whiteLabel ?? false,
      address: data?.address ?? "",
      zipCode: data?.zipCode ?? "",
      city: data?.city ?? "",
      state: data?.state ?? "",
      country: data?.country ?? "",
      agencyLogo: data?.agencyLogo ?? "",
    },
  });
  const router = useRouter();
  const isLoading = form.formState.isLoading;
  const [deletingAgency, setDeletingAgency] = useState(false);

  useEffect(() => {
    form.reset(data);
  }, [data]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let newUserData;
      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.state,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.state,
          },
        };
      }
      newUserData = await initUser({ role: "AGENCY_OWNER" });
      if (!data?.id) {
        const response = await upsertAgency({
          id: data?.id ? data?.id : uuid4(),
          // customerId: data?.customerId ?? custId ?? "",
          name: values.name,
          agencyLogo: values.agencyLogo,
          companyEmail: values.companyEmail,
          companyPhone: values.companyPhone,
          whiteLabel: values.whiteLabel,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
          goal: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        if (data?.id) return router.refresh();
        console.log(response);
        if (response) {
          return router.refresh();
        }
        toast({
          title: "Agency Created",
          description: "Your agency has been created successfully",
        });
      }
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgency = async (agencyId: string) => {
    if (!agencyId) return;
    setDeletingAgency(true);
    try {
      await deleteAgency(agencyId);
      toast({
        title: "Agency Deleted",
        description:
          "Your agency and all sub accounts have been deleted successfully",
      });
      router.refresh();
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setDeletingAgency(false);
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>Agency Information</CardHeader>
        <CardDescription className={"px-6"}>
          Lets create an agency for your business.You can edit agency settings
          later from the agency settings tab.
        </CardDescription>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="agencyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AgencyLogo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex w-full md:flex-row flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Company Name" />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.name?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Agency Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="email"
                          placeholder="Company Email"
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.companyEmail?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="companyPhone"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Agency Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Agency Phone" />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.companyPhone?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whiteLabel"
                render={({ field }) => (
                  <FormItem className="flex-grow flex items-center justify-between rounded-lg border gap-4 p-4">
                    <div>
                      <FormLabel>Whitelabel Agency</FormLabel>
                      <FormDescription>
                        Turning on white label mode will show your agency logo
                        to all sub account by default.You can overwrite this
                        functionality through sub account settings.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.whiteLabel?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Address" />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.address?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex w-full md:flex-row flex-col gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City" />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.city?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="email"
                          placeholder="State"
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.state?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>ZipCode</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="email"
                          placeholder="ZipCode"
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.zipCode?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="email"
                        placeholder="Country"
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.country?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <FormLabel>Create A Goal</FormLabel>
                <FormDescription>
                  ✨ Create a goal for your agency.As your business grow your
                  goals grow too so dont forget to set the bar higher!
                </FormDescription>
                <NumberInput
                  defaultValue={data?.goal}
                  onValueChange={async (val: number) => {
                    if (!data?.id) return;
                    await updatedAgencyDetails(data?.id, { goal: val });
                    await saveActivityLogsNotification({
                      agencyId: data?.id,
                      description: `Updated the agency goal to ${val} Sub account.`,
                      subAccountId: undefined,
                    });
                    router.refresh();
                  }}
                  min={1}
                  className="bg-background !border !border-input"
                  placeholder="Sub account goal"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Agency Information"
                )}
              </Button>
            </form>
          </Form>
          <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
            <div>
              <div>Danger Zone</div>
            </div>
            <div className="text-muted-foreground">
              Deleting your agency cannot be undone.This will also delete all
              sub accounts and all data related to your sub accounts.Sub
              accounts will no longer have access to funnels, contacts etc.
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              disabled={isLoading || deletingAgency}
              className="text-red-600 p-2 text-center mt-2 border-[1px] border-red-500 rounded-md hover:bg-red-600  hover:text-white whitespace-nowrap"
            >
              {deletingAgency ? "Deleting..." : "Delete Agency"}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  agency account and all related sub account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteAgency(data?.id)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;
