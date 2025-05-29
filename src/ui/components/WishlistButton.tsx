"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddToWishlistMutation } from "@/gql/graphql";

export function WishlistButton({ productId, channel }: { productId: string; channel: string }) {
	const [added, setAdded] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleAdd = async (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			const res = await fetch("/api/wishlist/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ productId }),
			});
			const data = (await res.json()) as { addToWishlist: AddToWishlistMutation["addToWishlist"] };
			setAdded(data.addToWishlist?.wishlist !== null);
			router.push(`/${channel}/wishlist`);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			className={`text-xl ${added ? "text-red-500" : "text-neutral-400 hover:text-red-500"}`}
			onClick={handleAdd}
			disabled={loading || added}
			aria-label={added ? "Added to wishlist" : "Add to wishlist"}
			title={added ? "Added to wishlist" : "Add to wishlist"}
		>
			{added ? "❤️" : "🤍"}
		</button>
	);
}
