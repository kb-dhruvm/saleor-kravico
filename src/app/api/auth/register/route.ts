import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body: any = await req.json();
		const { firstName, lastName, email, password } = body;
		const channel = body.channel || "online-inr";
		const redirectUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL + "/verify";

		if (!email || !password) {
			return NextResponse.json({ message: "All fields are required" }, { status: 400 });
		}

		// Dynamically import server-only modules
		const { getServerAuthClient } = await import("@/app/config");
		const { executeGraphQL } = await import("@/lib/graphql");
		const { saveIdToCookie } = await import("@/lib/checkout");
		const { AccountRegisterDocument, GetUserDocument } = await import("@/gql/graphql");

		const { accountRegister } = await executeGraphQL(AccountRegisterDocument, {
			variables: {
				firstName,
				lastName,
				email,
				password,
				channel,
				redirectUrl,
			},
			cache: "no-store",
		});

		if (accountRegister?.errors?.length) {
			return NextResponse.json(
				{ message: accountRegister.errors.map((e: any) => e.message).join(", ") },
				{ status: 400 },
			);
		}

		// Sign in after registration
		const { data } = await (await getServerAuthClient()).signIn({ email, password }, { cache: "no-store" });
		if (data.tokenCreate.errors.length > 0) {
			return NextResponse.json(
				{ message: data.tokenCreate.errors.map((e: any) => e.message).join(", ") },
				{ status: 401 },
			);
		}

		// Fetch user checkouts and store in cookies
		const userRes = await executeGraphQL(GetUserDocument, {
			variables: { email },
			cache: "no-store",
		});
		const checkouts = userRes.user?.checkouts?.edges || [];
		for (const edge of checkouts) {
			const checkoutId = edge.node.id;
			const channelSlug = edge.node.channel?.slug;
			if (checkoutId && channelSlug) {
				await saveIdToCookie(channelSlug, checkoutId);
			}
		}

		return NextResponse.json({ message: "Registration successful", redirectUrl });
	} catch (error: any) {
		return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
	}
}
