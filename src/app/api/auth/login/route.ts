import { getServerAuthClient } from "@/app/config";
import { CheckoutAddLineDocument } from "@/gql/graphql";
import {
	getCurrentUser,
	attachCheckoutToCurrentUser,
	getIdFromCookies,
	find,
	removeIdFromCookie,
	saveIdToCookie,
} from "@/lib/checkout";
import { executeGraphQL } from "@/lib/graphql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body: any = await req.json();
		const { email, password, channel } = body;
		if (!email || !password) {
			return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
		}

		const { data } = await (await getServerAuthClient()).signIn({ email, password }, { cache: "no-store" });
		if (data.tokenCreate.errors.length > 0) {
			return NextResponse.json(
				{ message: data.tokenCreate.errors.map((e) => e.message).join(", ") },
				{ status: 401 },
			);
		}

		const checkoutId = await getIdFromCookies(channel);

		const user = await getCurrentUser();

		if (checkoutId && !!user?.checkouts?.edges && user.checkouts.edges.length === 0) {
			await attachCheckoutToCurrentUser(checkoutId, user.id);
		}

		const checkouts = user?.checkouts?.edges || [];
		if (checkouts.length > 0) {
			// attach all the product variant checkout present in the checkoutId in the checkouts.checkoutId if channel matches
			if (checkouts[0].node.channel?.slug === channel) {
				const checkout = await find(checkoutId);
				if (checkout) {
					for (const line of checkout.lines) {
						await executeGraphQL(CheckoutAddLineDocument, {
							variables: {
								id: checkouts[0].node.id,
								productVariantId: decodeURIComponent(line.variant.id),
							},
							cache: "no-cache",
						});
					}
				}
				await removeIdFromCookie();
				await saveIdToCookie(channel, checkouts[0].node.id);
			}
		}
		return NextResponse.json({ message: "Login successful", redirectUrl: `/${channel}` });
	} catch (error: any) {
		return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
	}
}
