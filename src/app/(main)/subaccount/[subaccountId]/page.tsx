import React from "react";

const Page = async ({
  params,
}: {
  params: Promise<{ subaccountId: string }>;
}) => {
  const { subaccountId } = await params;
  return <div>Sub account Id is {subaccountId}</div>;
};

export default Page;
