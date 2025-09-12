export const FLAGS = {
  EMAIL_VERIFICATION_ENABLED:
    (process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED ?? "false") === "true",
};