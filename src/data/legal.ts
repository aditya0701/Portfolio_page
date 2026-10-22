import { profile } from "./profile";

/**
 * The data controller / provider identification shown on the Impressum and the
 * Datenschutzerklärung. Kept in one place so the two pages cannot disagree.
 * The postal address is the one already published on the résumé.
 */
export const legal = {
  name: profile.name,
  street: "Kastanienweg 12",
  city: "52074 Aachen",
  country: { de: "Deutschland", en: "Germany" },
  email: profile.email,
  updated: { de: "Oktober 2026", en: "October 2026" },
} as const;
