import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"; 

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
export default clerkMiddleware(async(auth, req) => {
  if(isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // This tells Next.js to run the gatekeeper for every page except static files like images
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};