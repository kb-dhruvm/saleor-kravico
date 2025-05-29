"use client";
import { MyWishlistQuery } from "@/gql/graphql";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";

export default function Wishlist({ channel }: { channel: string }) {
	const [wishlist, setWishlist] = useState<MyWishlistQuery["wishlistItems"] | null>(null);
	const [loading, setLoading] = useState(true);

	const handleRemove = async (wishlistId: string) => {
		await fetch("/api/wishlist/remove", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ wishlistId }),
		});
	};

	const getWishlist = async () => {
		try {
			const res = await fetch("/api/wishlist/list");
			const data = (await res.json()) as { wishlistItems: MyWishlistQuery["wishlistItems"] };
			setWishlist(data.wishlistItems);
			setLoading(false);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getWishlist();
	}, []);

	if (loading) return <div className="p-8">Loading wishlist...</div>;

	return (
		<div className="mx-auto max-w-3xl p-8">
			<h1 className="mb-6 text-2xl font-bold">My Wishlist</h1>
			{wishlist?.edges?.length === 0 && <div className="text-neutral-500">Your wishlist is empty.</div>}
			<ul className="space-y-4">
				{wishlist?.edges?.map((item) => (
					<li key={item?.node?.id} className="flex items-center gap-4 border-b pb-4">
						<Link href={`${channel}/products/${item?.node?.product?.slug}`}>
							<img
								src={item?.node?.product?.thumbnail?.url || "/placeholder.png"}
								alt={item?.node?.product?.thumbnail?.alt || item?.node?.product?.name}
								className="h-20 w-20 rounded object-cover"
							/>
						</Link>
						<div className="flex-1">
							<Link href={`${channel}/products/${item?.node?.product?.slug}`}>
								<div className="font-semibold hover:underline">{item?.node?.product?.name}</div>
							</Link>
							<div className="text-neutral-500">
								{item?.node?.product?.pricing?.priceRange?.start?.gross.amount}{" "}
								{item?.node?.product?.pricing?.priceRange?.start?.gross.currency}
							</div>
						</div>
						<button
							className="text-red-500 hover:text-red-700"
							onClick={() => handleRemove(item?.node?.id || "")}
							disabled={loading}
							aria-label="Remove from wishlist"
						>
							🗑
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
