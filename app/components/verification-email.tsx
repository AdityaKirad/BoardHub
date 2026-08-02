import {
  Html,
  Head,
  Body,
  Tailwind,
  Container,
  Section,
  Hr,
  Heading,
  Text,
  Link,
} from "@react-email/components";
import { AppLogo } from "./icons/app-logo";

export function VerificationEmail(
  args: {
    email: string;
  } & (
    { type: "signup"; code: string } | { type: "password-reset"; url: string }
  ),
) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body>
          <Container className="h-screen max-w-lg bg-white p-4">
            <Section className="text-primary text-5xl">
              <AppLogo height={48} width={48} />
              BoardHub
            </Section>
            <Hr />
            {args.type === "signup" ? (
              <>
                <Heading className="text-2xl text-blue-900">
                  You're nearly there
                </Heading>
                <Text>Hi {args.email.split("@")[0]}</Text>
                <Text>Your verification code is:</Text>
                <Text>{args.code}</Text>
                <Text>
                  Enter this verification code to continue setting up your
                  BoardHub account. This code will expire in 10 minutes.
                </Text>
                <Text>
                  If you didn't request this code, please ignore this email.
                </Text>
              </>
            ) : (
              <>
                <Text>Hi</Text>
                <Text>
                  We've received a request to set a new password for this
                  BoardHub account:
                </Text>
                <strong>{args.email}</strong>
                <Link href={args.url}>Set Password</Link>
                <Text>
                  If you didn't request this, you can safely ignore this email.
                </Text>
              </>
            )}
            <Hr />
            <Section className="text-primary text-4xl">
              <AppLogo height={36} width={36} />
              BoardHub
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
