import { render } from "@react-email/render";
import { env } from "~/env.server";

export async function sendEmail({
  react,
  subject,
  to,
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}) {
  try {
    const response = await fetch("https://next-api.useplunk.com/v1/send", {
      method: "POST",
      body: JSON.stringify({
        to,
        subject,
        body: await render(react),
      }),
      headers: {
        Authorization: `Bearer ${env.PLUNK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(
        "Plunk API Mail Failure: ",
        JSON.stringify(
          {
            status: response.status,
            ...(await response.json()),
          },
          null,
          2,
        ),
      );
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Network/System error executing sendEmail:", error);
    return { success: false };
  }
}
