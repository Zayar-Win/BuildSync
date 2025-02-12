import { Button } from "@/components/ui/button";
import routes from "@/routes/routes";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <Button>
          <Link href={routes.SIGNIN}>Sign In</Link>
        </Button>
      </SignedOut>
    </div>
  );
}
