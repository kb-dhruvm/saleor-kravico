"use server";

import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";
import { invariant } from "ts-invariant";
import { revalidatePath } from "next/cache";

export async function addItemToCart(id: string, channel: string, size: string) {
	try {
		if (!id) {
			return;
		}

		console.log(await Checkout.getIdFromCookies(channel), id);

		const checkout = await Checkout.findOrCreate({
			checkoutId: await Checkout.getIdFromCookies(channel),
			channel: channel,
		});
		invariant(checkout, "This should never happen");

		await Checkout.saveIdToCookie(channel, checkout.id);

		// TODO: error handling
		const res = await executeGraphQL(CheckoutAddLineDocument, {
			variables: {
				id: checkout.id,
				productVariantId: decodeURIComponent(id),
			},
			cache: "no-cache",
		});

		console.log(res);

		revalidatePath("/cart");
	} catch (error) {
		console.error("Error in addItemToCart:", error);
	}
}
