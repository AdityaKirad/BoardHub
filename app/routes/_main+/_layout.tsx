import {
  BellIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CircleIcon,
  SunMoonIcon,
  UsersIcon,
} from "lucide-react";
import { Link, Outlet, useRouteLoaderData } from "react-router";
import { Theme, useTheme } from "remix-themes";
import type { UserSelectType } from "~/.server/db/schema/auth";
import { AppLogo } from "~/components/icons/app-logo";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getInitials } from "~/lib/utils";
import type { loader } from "~/root";

export default function Page() {
  const data = useRouteLoaderData<typeof loader>("root");
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-2 py-1">
        <Link
          className="hover:bg-border focus-visible:bg-muted flex items-center gap-0.5 rounded px-1.5 py-1 transition-colors"
          to="/"
          onClick={() => {
            /* empty */
          }}>
          <AppLogo height={32} width={32} />
          <span className="text-sm font-medium">BoardHub</span>
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

          <UserDropdownMenu user={data?.user} />
        </div>
      </div>

      <Outlet />
    </div>
  );
}

function UserDropdownMenu({
  user,
}: {
  user:
    | Pick<UserSelectType, "name" | "email" | "username" | "photo">
    | null
    | undefined;
}) {
  const [theme, themeSet] = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded" variant="ghost" size="icon">
          <Avatar>
            <AvatarImage src={user?.photo ?? ""} alt={`@${user?.username}`} />
            <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>ACCOUNT</DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user?.photo ?? ""} alt={`@${user?.username}`} />
              <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
            </Avatar>
            <div>
              <p>{user?.name}</p>
              <p>{user?.email}</p>
            </div>
          </div>
          <DropdownMenuItem asChild>
            <Link to="/login/select-account">Switch accounts</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">Manage account</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>BOARDHUB</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link to={`/${user?.username}/profile`}>
              Profile and visibility
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/${user?.username}/cards`}>Cards</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/${user?.username}/settings`}>Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunMoonIcon />
              Theme
              <ChevronRightIcon />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => themeSet(Theme.LIGHT)}>
                {theme === Theme.LIGHT ? <CircleCheckIcon /> : <CircleIcon />}
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => themeSet(Theme.DARK)}>
                {theme === Theme.DARK ? <CircleCheckIcon /> : <CircleIcon />}
                Dark
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <UsersIcon />
            Create Workspace
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to="/logout">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
