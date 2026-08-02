import { useId } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { PasswordInput } from "./password-input";
import { REGEXP_ONLY_DIGITS_AND_CHARS, type OTPInputProps } from "input-otp";
import { InputOTP, InputOTPSlot } from "./input-otp";

type ErrorListType = (string | null | undefined)[] | null | undefined;

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
  children,
}: {
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  errors?: ErrorListType;
  children?: React.ReactNode;
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
      {children}
    </div>
  );
}

export function OTPField({
  inputProps,
  errors,
}: {
  inputProps: Partial<OTPInputProps & { render: never }>;
  errors?: ErrorListType;
}) {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = id ? `${id}-error` : undefined;
  return (
    <div className="space-y-1">
      <InputOTP
        containerClassName="gap-2"
        id={id}
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        {...inputProps}>
        <InputOTPSlot className="aspect-square h-full flex-1" index={0} />
        <InputOTPSlot className="aspect-square h-full flex-1" index={1} />
        <InputOTPSlot className="aspect-square h-full flex-1" index={2} />
        <InputOTPSlot className="aspect-square h-full flex-1" index={3} />
        <InputOTPSlot className="aspect-square h-full flex-1" index={4} />
        <InputOTPSlot className="aspect-square h-full flex-1" index={5} />
      </InputOTP>
      <ErrorList errors={errors} id={errorId} />
    </div>
  );
}
