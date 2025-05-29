import { CurrentUserDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import Wishlist from "@/ui/components/Wishlist";
import Link from "next/link";

export default async function WishlistPage({ params }: { params: Promise<{ channel: string }> }) {
	const { channel } = await params;

	const { me: user } = await executeGraphQL(CurrentUserDocument, {
		cache: "no-cache",
	});

	if (!user) {
		return (
			<div className="mx-auto max-w-3xl p-8">
				<h1 className="mb-6 text-2xl font-bold">My Wishlist</h1>
				<p>You must be logged in to view your wishlist.</p>
				<Link href={`/${channel}/login`} className="text-blue-500 hover:underline" aria-label="Login">
					Login
				</Link>
			</div>
		);
	}

	return <Wishlist channel={channel} />;
}
