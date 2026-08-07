import { Form } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Fragment } from "react";
import { getInitials } from "~/lib/utils";
import { LogOutIcon } from "lucide-react";

export function AccountsList({
  accounts,
  action,
}: {
  accounts: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      photo: string | null;
    };
  }[];
  action: "select-account" | "remove-account";
}) {
  return (
    <Form method="POST">
      {accounts.map(({ token, user }) => (
        <Fragment key={user.id}>
          <Button
            className="flex w-full items-center justify-start gap-4 py-8"
            type="submit"
            variant="ghost"
            {...(action === "remove-account"
              ? { formAction: `/logout/${token}` }
              : { name: "token", value: token })}>
            <Avatar>
              <AvatarImage src={user.photo ?? ""} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="text-left text-base text-slate-950">
              <p>{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            {action === "remove-account" && (
              <LogOutIcon className="stroke-muted-foreground ml-auto" />
            )}
          </Button>
          <Separator />
        </Fragment>
      ))}
    </Form>
  );
}
