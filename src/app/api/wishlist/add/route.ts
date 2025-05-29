import { AddToWishlistDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body: any = await req.json();
		const { productId } = body;

		const { addToWishlist } = await executeGraphQL(AddToWishlistDocument, {
			variables: { productId },
			cache: "no-store",
		});

		return NextResponse.json({ addToWishlist }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: error }, { status: 500 });
	}
}
