export const getAlertify = () =>
  import("alertifyjs").then((m) => m.default ?? m);