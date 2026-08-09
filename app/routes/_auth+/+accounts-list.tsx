import { Form } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Fragment } from "react";
import { getInitials } from "~/lib/utils";
import { LogOutIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

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
  if (action === "remove-account") {
    return (
      <>
        {accounts.map(({ token, user }) => (
          <Dialog key={user.id}>
            <DialogTrigger asChild>
              <Button
                className="flex w-full items-center justify-start gap-4 py-8"
                variant="ghost">
                <Avatar>
                  <AvatarImage src={user.photo ?? ""} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="text-left text-base text-slate-950">
                  <p>{user.name}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <LogOutIcon className="stroke-muted-foreground ml-auto" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="top-1/4 rounded-[1rem]"
              showCloseButton={false}>
              <DialogTitle>Remove account</DialogTitle>
              <DialogDescription>
                You can always add the account for{" "}
                <span className="font-bold text-zinc-950">{user.email}</span>{" "}
                back to this browser when you're ready to use it again.
              </DialogDescription>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
                <Form method="POST" action={`/logout/${token}`}>
                  <Button className="rounded-2xl" type="submit">
                    Remove
                  </Button>
                </Form>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </>
    );
  }
  return (
    <Form method="POST">
      {accounts.map(({ token, user }) => (
        <Fragment key={user.id}>
          <Button
            className="flex w-full items-center justify-start gap-4 py-8"
            type="submit"
            variant="ghost"
            name="token"
            value={token}>
            <Avatar>
              <AvatarImage src={user.photo ?? ""} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="text-left text-base text-slate-950">
              <p>{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </Button>
          <Separator />
        </Fragment>
      ))}
    </Form>
  );
}
