import { AppLogo } from "~/components/icons/app-logo";
import type { Route } from "./+types/_index";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import HomeIllustration from "~/assets/home-illustration.webp";
import { requireAnonymous } from "~/.server/session";

export function meta() {
  return [
    { title: "Capture, organize, tackle your to-dos from anywhere" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const loader = ({ request }: Route.LoaderArgs) =>
  requireAnonymous(request);

export default function Page() {
  return (
    <>
      <header className="sticky top-0 flex items-center px-4 py-2 shadow-md">
        <Link
          className="flex items-center gap-1 text-xl font-bold md:gap-2 md:text-4xl"
          to="/">
          <AppLogo className="max-md:size-8" />
          <span>BoardHub</span>
        </Link>

        <Button className="mr-2 ml-auto" size="lg" variant="link" asChild>
          <Link to="/login"> Log in </Link>
        </Button>
        <Button size="lg" asChild>
          <Link to="/signup"> Sign up </Link>
        </Button>
      </header>

      <main className="mt-10 flex items-center gap-8 px-12 max-lg:flex-col max-lg:px-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold md:text-4xl">
            BoardHub helps teams move work forward.
          </h1>
          <p className="text-xl">
            Collaborate, manage projects, and reach new productivity peaks. From
            high rises to the home office, the way your team works is unique -
            accomplish it all with BoardHub.
          </p>
        </div>
        <div className="w-full flex-1">
          <img
            src={HomeIllustration}
            alt="Home illustration"
            decoding="async"
            loading="lazy"
          />
        </div>
      </main>
    </>
  );
}
