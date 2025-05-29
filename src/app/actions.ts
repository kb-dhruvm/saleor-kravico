"use server";

import { getServerAuthClient } from "@/app/config";
import { removeIdFromCookie } from "@/lib/checkout";

export async function logout() {
	"use server";
	(await getServerAuthClient()).signOut();
	await removeIdFromCookie();
}
