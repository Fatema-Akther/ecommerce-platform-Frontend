import { BaseAPI } from "@/lib/api/baseApi";
import { useSessionStore } from "@/stores/session";

export async function logoutUser() {
  try {
    await BaseAPI.logout();
  } catch (e) {
    // optional: console.error(e);
  } finally {
    useSessionStore.getState().logout();
  }
}