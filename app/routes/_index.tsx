import { AppLogo } from "~/components/icons/app-logo";
import type { Route } from "./+types/_index";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import HomeIllustration from "~/assets/home-illustration.webp";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 flex items-center px-4 py-2 shadow-md">
        <Link
          className="flex items-center gap-2 text-4xl font-bold text-blue-950"
          to="/"
        >
          <AppLogo />
          <span>Trellix</span>
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
          <h1 className="text-4xl font-bold">
            Trellix helps teams move work forward.
          </h1>
          <p className="text-xl">
            Collaborate, manage projects, and reach new productivity peaks. From
            high rises to the home office, the way your team works is unique -
            accomplish it all with Trellix.
          </p>
        </div>
        <img
          className="w-full flex-1"
          src={HomeIllustration}
          alt="Home illustration"
          decoding="async"
          loading="lazy"
        />
      </main>
    </>
  );
}
