import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
  "/site",
  "/api/uploadthing",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  const url = request.nextUrl;
  const searchParams = url.searchParams.toString();
  const hostName = request.headers;
  const pathNameWithParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  const customSubDomain = hostName
    .get("host")
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN as string}`)
    ?.filter(Boolean)[0];

  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  await auth.protect();

  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathNameWithParams}`, request.url)
    );
  }
  if (url.pathname == "/sign-up" || url.pathname == "/sign-in") {
    return NextResponse.redirect(new URL("/agency/sign-in", request.url));
  }

  if (
    url.pathname == "/" ||
    (url.pathname == "/site" && url.host == process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.redirect(new URL("/site", request.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
