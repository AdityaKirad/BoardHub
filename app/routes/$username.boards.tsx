import { AppLogo } from "~/components/icons/app-logo";
import type { Route } from "./+types/$username.boards";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { BellIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { requireUser } from "~/.server/session";
import { getInitials } from "~/lib/utils";

export const meta: Route.MetaFunction = () => [{ title: "Boards | BoardHub" }];

export const loader = ({ request }: Route.LoaderArgs) => requireUser(request);

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header className="flex items-center justify-between border-b px-2 py-1">
        <Link
          className="hover:bg-border focus-visible:bg-muted flex items-center gap-0.5 rounded px-1.5 py-1 transition-colors"
          to="/"
          onClick={() => {
            /* empty */
          }}>
          <AppLogo height={32} width={32} />
          <span className="text-sm font-medium text-blue-950">BoardHub</span>
        </Link>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <BellIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent></DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar>
                  <AvatarImage
                    src={loaderData.photo ?? ""}
                    alt={`@${loaderData.username}`}
                  />
                  <AvatarFallback>
                    {getInitials(loaderData.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-80">
              <DropdownMenuGroup>
                <DropdownMenuLabel>ACCOUNT</DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={loaderData.photo ?? ""}
                      alt={`@${loaderData.username}`}
                    />
                    <AvatarFallback>
                      {getInitials(loaderData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{loaderData.name}</p>
                    <p>{loaderData.email}</p>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/login/select-account">Switch accounts</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Manage account</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
