import { ZxcvbnFactory, type OptionsType } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

export const MIN_PASSWORD_LENGTH = 8;

export const STRENGTH_LABELS = [
  "Weak",
  "Fair",
  "Good",
  "Strong",
  "Very Strong",
] as const;
export type StrengthLabel = (typeof STRENGTH_LABELS)[number];

const options: OptionsType = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
};

const zxcvbn = new ZxcvbnFactory(options);

export interface PasswordStrengthResult {
  score: number | null;
  label: StrengthLabel | null;
}

export function checkPasswordStrength(
  password: string,
): PasswordStrengthResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { score: null, label: null };
  }

  const result = zxcvbn.check(password);

  return {
    score: result.score,
    label: STRENGTH_LABELS[result.score],
  };
}
