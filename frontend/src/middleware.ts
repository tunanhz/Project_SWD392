import createMiddleware from 'next-intl/middleware';
import {routing} from './navigation';
 
export default createMiddleware(routing);
 
export const config = {
  // Matcher ignoring `/_next` and `/api`
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Optional: Only run on root (optional if using always prefix)
    '/'
  ]
};
