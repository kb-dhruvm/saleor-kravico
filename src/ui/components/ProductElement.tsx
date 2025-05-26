"use client";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";

import type { ProductListItemFragment } from "@/gql/graphql";
import { formatMoneyRange } from "@/lib/utils";
import { useState } from "react";

export function ProductElement({
	product,
	loading,
	priority,
}: { product: ProductListItemFragment } & { loading: "eager" | "lazy"; priority?: boolean }) {
	const [hovered, setHovered] = useState(false);

	return (
		<li data-testid="ProductElement">
			<LinkWithChannel href={`/products/${product.slug}`} key={product.id}>
				<div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
					{!hovered &&
						product?.attributes
							.find(
								({ values, attribute }) =>
									values.find(({ inputType }) => inputType === "FILE") && attribute.slug === "thumbnail",
							)
							?.values.find(({ file }) => file?.url)?.file?.url && (
							<ProductImageWrapper
								loading={loading}
								src={
									product?.attributes
										.find(
											({ values, attribute }) =>
												values.find(({ inputType }) => inputType === "FILE") &&
												attribute.slug === "thumbnail",
										)
										?.values.find(({ file }) => file?.url)?.file?.url ?? ""
								}
								alt={
									product?.attributes
										.find(
											({ values, attribute }) =>
												values.find(({ inputType }) => inputType === "FILE") &&
												attribute.slug === "thumbnail",
										)
										?.values.find(({ file }) => file?.url)?.name ?? ""
								}
								width={512}
								height={512}
								sizes={"512px"}
								priority={priority}
							/>
						)}
					{hovered &&
						product?.attributes
							.find(
								({ values, attribute }) =>
									values.find(({ inputType }) => inputType === "FILE") &&
									attribute.slug === "thumbnail-hovered",
							)
							?.values.find(({ file }) => file?.url)?.file?.url && (
							<ProductImageWrapper
								loading={loading}
								src={
									product?.attributes
										.find(
											({ values, attribute }) =>
												values.find(({ inputType }) => inputType === "FILE") &&
												attribute.slug === "thumbnail-hovered",
										)
										?.values.find(({ file }) => file?.url)?.file?.url ?? ""
								}
								alt={
									product?.attributes
										.find(
											({ values, attribute }) =>
												values.find(({ inputType }) => inputType === "FILE") &&
												attribute.slug === "thumbnail-hovered",
										)
										?.values.find(({ file }) => file?.url)?.name ?? ""
								}
								width={512}
								height={512}
								sizes={"512px"}
								priority={priority}
							/>
						)}
					<div className="mt-2 flex justify-between">
						<div>
							<h3 className="mt-1 text-sm font-semibold text-neutral-900">{product.name}</h3>
							<p className="mt-1 text-sm text-neutral-500" data-testid="ProductElement_Category">
								{product.category?.name}
							</p>
						</div>
						<p className="mt-1 text-sm font-medium text-neutral-900" data-testid="ProductElement_PriceRange">
							{formatMoneyRange({
								start: product?.pricing?.priceRange?.start?.gross,
								stop: product?.pricing?.priceRange?.stop?.gross,
							})}
						</p>
					</div>
				</div>
			</LinkWithChannel>
		</li>
	);
}
