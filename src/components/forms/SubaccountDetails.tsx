"use client";
import { Agency } from "@prisma/client";
import React from "react";

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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/global/FileUpload";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { v4 as uuid4 } from "uuid";
import { saveActivityLogsNotification, upsertSubAccount } from "@/lib/queries";
import { useModalContext } from "@/providers/ModalProvider";

type SubaccountDetailsProps = {
  agencyDetails: Agency;
  data: Partial<Agency>;
  userName: string;
  userId: string;
};

const FormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Subaccount name must be at least 2 characters long" }),
  companyEmail: z.string().email({ message: "Invalid email address" }),
  companyPhone: z
    .string()
    .min(1, { message: "Phone number must be at least 1 characters long" }),
  address: z
    .string()
    .min(1, { message: "Address must be at least 1 characters long" }),
  zipCode: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  subAccountLogo: z.string().min(1),
});

const SubaccountDetails = ({
  data,
  agencyDetails,
  userName,
  userId,
}: SubaccountDetailsProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name ?? "",
      companyEmail: data?.companyEmail ?? "",
      companyPhone: data?.companyPhone ?? "",
      address: data?.address ?? "",
      zipCode: data?.zipCode ?? "",
      city: data?.city ?? "",
      state: data?.state ?? "",
      country: data?.country ?? "",
      subAccountLogo: data?.agencyLogo ?? "",
    },
  });
  const router = useRouter();
  const { setClose } = useModalContext();
  const isLoading = form.formState.isLoading;

  useEffect(() => {
    form.reset(data);
  }, [data]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const response = await upsertSubAccount({
        id: data?.id ? data?.id : uuid4(),
        // customerId: data?.customerId ?? custId ?? "",
        name: values.name,
        subAccountLogo: values.subAccountLogo,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
        goal: 5,
        agencyId: agencyDetails.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      if (!response) {
        throw new Error("Failed to create subaccount");
      }
      await saveActivityLogsNotification({
        agencyId: response.agencyId,
        description: `${userName} updated subaccount | ${response.name}`,
        subAccountId: response.id,
      });
      toast({
        title: "Subaccount Created",
        description: "Successfully save user account details",
      });
      setClose();
      router.refresh();
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>SubAccount Information</CardHeader>
      <CardDescription className={"px-6"}>
        Please enter sub account detail.
      </CardDescription>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subAccountLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subaccount Logo</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
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
                      <Input {...field} className="email" placeholder="State" />
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
                    <Input {...field} className="email" placeholder="Country" />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.country?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save Subaccount Information"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubaccountDetails;
