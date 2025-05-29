import { RemoveFromWishlistDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body: any = await req.json();
		const { wishlistId } = body;

		const { removeFromWishlist } = await executeGraphQL(RemoveFromWishlistDocument, {
			variables: { wishlistId },
			cache: "no-store",
		});

		return NextResponse.json({ data: removeFromWishlist }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: error }, { status: 500 });
	}
}
