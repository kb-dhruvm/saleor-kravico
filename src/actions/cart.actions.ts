"use server";

import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";
import { invariant } from "ts-invariant";
import { revalidatePath } from "next/cache";

export async function addItemToCart(formData: FormData) {
	const selectedVariantID = formData.get("selectedVariantID") as string;
	const channel = formData.get("channel") as string;

	if (!selectedVariantID) {
		return;
	}

	const checkout = await Checkout.findOrCreate({
		checkoutId: await Checkout.getIdFromCookies(channel),
		channel: channel,
	});
	invariant(checkout, "This should never happen");

	await Checkout.saveIdToCookie(channel, checkout.id);

	// TODO: error handling
	await executeGraphQL(CheckoutAddLineDocument, {
		variables: {
			id: checkout.id,
			productVariantId: decodeURIComponent(selectedVariantID),
		},
		cache: "no-cache",
	});

	revalidatePath("/cart");
}
