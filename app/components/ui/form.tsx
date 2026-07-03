import { useId, useRef } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { PasswordInput } from "./password-input";

type ErrorListType = Array<string | null | undefined> | null | undefined;

export function ErrorList({
  errors,
  id,
}: {
  errors?: ErrorListType;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) {
    return null;
  }
  return (
    <ul className="text-destructive flex flex-col gap-1 text-sm" id={id}>
      {errorsToRender.map((err) => (
        <li key={err}>{err}</li>
      ))}
    </ul>
  );
}

export function Field({
  inputProps,
  labelProps,
  errors,
}: {
  errors?: ErrorListType;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className="space-y-1">
      {labelProps && <Label htmlFor={inputProps.id} {...labelProps} />}
      {inputProps.type === "password" ? (
        <PasswordInput
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          id={inputProps.id}
          {...inputProps}
        />
      ) : (
        <Input
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          id={inputProps.id}
          {...inputProps}
        />
      )}
      <ErrorList errors={errors} id={errorId} />
    </div>
  );
}
