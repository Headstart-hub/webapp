import { Alertify } from "alertifyjs";
declare module "alertifyjs" {
  const alertify: Alertify;
  export default alertify;
}