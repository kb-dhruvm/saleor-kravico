import { cookies } from "next/headers";
import {
	CheckoutCreateDocument,
	CheckoutFindDocument,
	CurrentUserDocument,
	CheckoutCustomerAttachDocument,
} from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export async function getIdFromCookies(channel: string) {
	const cookieName = `checkoutId-${channel}`;
	const checkoutId = (await cookies()).get(cookieName)?.value || "";
	return checkoutId;
}

export async function saveIdToCookie(channel: string, checkoutId: string) {
	const shouldUseHttps =
		process.env.NEXT_PUBLIC_STOREFRONT_URL?.startsWith("https") || !!process.env.NEXT_PUBLIC_VERCEL_URL;
	const cookieName = `checkoutId-${channel}`;
	(await cookies()).set(cookieName, checkoutId, {
		sameSite: "lax",
		secure: shouldUseHttps,
	});
}

export async function find(checkoutId: string) {
	try {
		const { checkout } = checkoutId
			? await executeGraphQL(CheckoutFindDocument, {
					variables: {
						id: checkoutId,
					},
					cache: "no-cache",
				})
			: { checkout: null };

		return checkout;
	} catch {
		// we ignore invalid ID or checkout not found
	}
}

export async function findOrCreate({ channel, checkoutId }: { checkoutId?: string; channel: string }) {
	if (!checkoutId) {
		return (await create({ channel })).checkoutCreate?.checkout;
	}
	const checkout = await find(checkoutId);
	return checkout || (await create({ channel })).checkoutCreate?.checkout;
}

export async function getCurrentUser() {
	try {
		const data = await executeGraphQL(CurrentUserDocument, { cache: "no-cache" });
		return data?.me;
	} catch {
		return null;
	}
}

export const create = async ({ channel }: { channel: string }) => {
	// Create the checkout
	const checkoutCreateResult = await executeGraphQL(CheckoutCreateDocument, {
		cache: "no-cache",
		variables: { channel },
	});
	const checkout = checkoutCreateResult?.checkoutCreate?.checkout;
	if (!checkout) return checkoutCreateResult;

	return checkoutCreateResult;
};

export const removeIdFromCookie = async () => {
	const allCookies = (await cookies()).getAll();
	for (const cookie of allCookies) {
		if (cookie.name.startsWith("checkoutId-")) {
			(await cookies()).delete(cookie.name);
		}
	}
};

export const attachCheckoutToCurrentUser = async (checkoutId: string, userId?: string) => {
	if (!userId) return;
	// Attach the checkout to the user
	await executeGraphQL(CheckoutCustomerAttachDocument, {
		cache: "no-cache",
		variables: { id: checkoutId, customerId: userId },
	});
};
