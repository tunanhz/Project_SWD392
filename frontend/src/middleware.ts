import createMiddleware from 'next-intl/middleware';
import {routing} from './navigation';
 
export default createMiddleware(routing);
 
export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
