import { Outlet } from "react-router";
import { AppLogo } from "~/components/icons/app-logo";
import AuthIllustration1 from "~/assets/auth-illustration-1.webp";
import AuthIllustration2 from "~/assets/auth-illustration-2.webp";

export default function Layout() {
  return (
    <main className="relative grid place-items-center sm:h-dvh">
      <div className="bg-background z-10 flex w-full max-w-100 flex-col gap-2 rounded-sm p-8 sm:shadow-lg">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-blue-950">
          <AppLogo />
          BoardHub
        </div>
        <Outlet />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-between max-md:hidden">
        <img
          src={AuthIllustration1}
          height="300"
          width="300"
          decoding="async"
          loading="lazy"
        />
        <img
          src={AuthIllustration2}
          height="300"
          width="300"
          decoding="async"
          loading="lazy"
        />
      </div>
    </main>
  );
}
