import { createThemeAction } from "remix-themes";
import { themeSessionResolver } from "~/.server/session/storage/theme";

export const action = createThemeAction(themeSessionResolver);
