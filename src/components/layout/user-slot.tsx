import { getCurrentUser } from "@/server/session";
import { AccountMenu } from "./account-menu";

/** Account button for the top bar. Reads the session, so it streams in behind <Suspense>. */
export async function UserSlot() {
  const user = await getCurrentUser();
  if (!user) return null;
  return <AccountMenu email={user.email} displayName={user.displayName} />;
}
