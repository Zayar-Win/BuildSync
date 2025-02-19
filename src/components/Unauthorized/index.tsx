import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h1 className="text-3xl font-bold ">Unauthorized</h1>
      <p className="pt-2 font-medium">
        Please contact to support or agency owner to get access.
      </p>
      <Button className="mt-6">
        <Link href={"/"}>Go Home</Link>
      </Button>
    </div>
  );
};

export default Unauthorized;
