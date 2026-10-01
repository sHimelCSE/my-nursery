import { redirect } from "next/navigation";

export default function MyOrdersRedirect() {
  redirect("/dashboard");
}
