import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // 匹配所有路由，排除内部路径、静态文件和 admin 路由
  matcher: [
    "/((?!api|_next|_vercel|admin|.*\\..*).*)",
  ],
};
