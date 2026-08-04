import { getUsers } from "~/.server/session";
import type { Route } from "./+types/login_.select-account";
import { data, redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const { headers, sessions } = await getUsers(request);

  if(!sessions.length) {
    return redirect("/login");
  }

  return data(sessions, { headers });
}

export default function Page() {
  return <>
    <h1 className="text-slate-950 text-center font-medium">Remove accounts from this browser</h1>
    
  </>;
}
