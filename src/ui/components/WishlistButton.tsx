"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddToWishlistMutation, RemoveFromWishlistMutation } from "@/gql/graphql";

export function WishlistButton({
	productId,
	channel,
	wishlistId,
}: {
	wishlistId: string | null | undefined;
	productId: string;
	channel: string;
}) {
	const [added, setAdded] = useState(!!wishlistId);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			let res, data;
			if (!added) {
				res = await fetch("/api/wishlist/add", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ productId }),
				});
				data = (await res.json()) as { addToWishlist: AddToWishlistMutation["addToWishlist"] };
				setAdded(true);
			} else {
				res = await fetch("/api/wishlist/remove", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ wishlistId }),
				});
				// You may want to check the response for success
				const result = (await res.json()) as { removeFromWishlist: { ok: boolean } };
				if (result?.removeFromWishlist?.ok) {
					setAdded(false);
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			className={`text-xl ${added ? "text-red-500" : "text-neutral-400 hover:text-red-500"}`}
			onClick={handleClick}
			disabled={loading}
			aria-label={added ? "Remove from wishlist" : "Add to wishlist"}
			title={added ? "Remove from wishlist" : "Add to wishlist"}
		>
			{added ? "❤️" : "🤍"}
		</button>
	);
}
