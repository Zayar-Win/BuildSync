import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/lib/db";
import { CheckCircleIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

type Props = {
  params: {
    agencyId: string;
  };
  searchParams: {
    code: string;
  };
};

const page = async ({ params, searchParams }: Props) => {
  const { agencyId } = await params;
  const agencyDetail = await db.agency.findUnique({
    where: {
      id: agencyId,
    },
  });
  if (!agencyDetail) return;

  const allDetailsExist =
    agencyDetail?.address &&
    agencyDetail?.companyEmail &&
    agencyDetail?.name &&
    agencyDetail?.companyPhone &&
    agencyDetail?.address &&
    agencyDetail?.agencyLogo &&
    agencyDetail?.country &&
    agencyDetail?.state &&
    agencyDetail?.city &&
    agencyDetail?.zipCode;
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Lets get started</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  alt={"app logo"}
                  height={80}
                  src={"/appstore.png"}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>Save the website as a shortcut on your mobile device.</p>
              </div>
              <Button>Start</Button>
            </div>
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  alt={"stripe logo"}
                  height={80}
                  src={"/stripelogo.png"}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>
                  Connect your stripe account to accept payments and see your
                  dashboard.
                </p>
              </div>
              <Button>Start</Button>
            </div>
            <div className="flex justify-between items-center w-full border p-4 rounded-lg gap-2">
              <div className="flex md:items-center gap-4 flex-col md:!flex-row">
                <Image
                  alt={"app logo"}
                  height={80}
                  src={agencyDetail?.agencyLogo}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>Fill in all your business details.</p>
              </div>
              {allDetailsExist ? (
                <CheckCircleIcon size={50} className="text-primary" />
              ) : (
                <Button>Start</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
