import { MyWishlistDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const { wishlistItems } = await executeGraphQL(MyWishlistDocument, {
			cache: "no-store",
		});

		return NextResponse.json({ wishlistItems }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: error }, { status: 500 });
	}
}
