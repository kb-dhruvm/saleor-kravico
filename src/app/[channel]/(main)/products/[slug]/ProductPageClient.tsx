"use client";
import { useState, useMemo } from "react";
import xss from "xss";
import edjsHTML from "editorjs-html";
import { AddButton } from "./AddButton";
import { VariantSelector } from "@/ui/components/VariantSelector";
import EmblaCarouselWithThumbs from "@/ui/components/EmblaCarouselWithThumbs";
import { formatMoney, formatMoneyRange } from "@/lib/utils";
import { AvailabilityMessage } from "@/ui/components/AvailabilityMessage";
import { type RelatedProductsQuery } from "@/gql/graphql";
import { ProductList } from "@/ui/components/ProductList";
const parser = edjsHTML();

export default function ProductPageClient({
	product,
	channel,
	addItemAction,
	relatedProducts,
}: {
	product: any;
	channel: string;
	addItemAction: (formData: FormData) => Promise<void>;
	relatedProducts: RelatedProductsQuery["products"];
}) {
	const variants = product.variants || [];
	const [selectedVariantID, setSelectedVariantID] = useState(
		variants.length > 0 ? variants[0].id : undefined,
	);
	const selectedVariant = variants.find(({ id }: any) => id === selectedVariantID);

	const mediaImages = selectedVariant?.media?.map((m: any) => ({ url: m.url, alt: m.alt })) || [];

	const description = useMemo(
		() => (product?.description ? parser.parse(JSON.parse(product?.description)) : null),
		[product?.description],
	);

	const isAvailable = variants?.some((variant: any) => variant.quantityAvailable) ?? false;

	const price = selectedVariant?.pricing?.price?.gross
		? formatMoney(selectedVariant.pricing.price.gross.amount, selectedVariant.pricing.price.gross.currency)
		: isAvailable
			? formatMoneyRange({
					start: product?.pricing?.priceRange?.start?.gross,
					stop: product?.pricing?.priceRange?.stop?.gross,
				})
			: "";

	// JSON-LD for SEO
	const productJsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		image: product.thumbnail?.url,
		...(selectedVariant
			? {
					name: `${product.name} - ${selectedVariant.name}`,
					description: product.seoDescription || `${product.name} - ${selectedVariant.name}`,
					offers: {
						"@type": "Offer",
						availability: selectedVariant.quantityAvailable
							? "https://schema.org/InStock"
							: "https://schema.org/OutOfStock",
						priceCurrency: selectedVariant.pricing?.price?.gross.currency,
						price: selectedVariant.pricing?.price?.gross.amount,
					},
				}
			: {
					name: product.name,
					description: product.seoDescription || product.name,
					offers: {
						"@type": "AggregateOffer",
						availability: product.variants?.some((variant: any) => variant.quantityAvailable)
							? "https://schema.org/InStock"
							: "https://schema.org/OutOfStock",
						priceCurrency: product.pricing?.priceRange?.start?.gross.currency,
						lowPrice: product.pricing?.priceRange?.start?.gross.amount,
						highPrice: product.pricing?.priceRange?.stop?.gross.amount,
					},
				}),
	};

	return (
		<>
			<section className="mx-auto grid max-w-7xl p-8">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(productJsonLd),
					}}
				/>
				<form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-8" action={addItemAction}>
					<input type="hidden" name="selectedVariantID" value={selectedVariantID || ""} />
					<input type="hidden" name="channel" value={channel} />
					<div className="md:col-span-1 lg:col-span-5">
						{mediaImages.length > 0 && <EmblaCarouselWithThumbs slides={mediaImages} />}
					</div>
					<div className="flex flex-col pt-6 sm:col-span-1 sm:px-6 sm:pt-0 lg:col-span-3 lg:pt-16">
						<div>
							<h1 className="mb-4 flex-auto text-3xl font-medium tracking-tight text-neutral-900">
								{product?.name}
							</h1>
							<p className="mb-8 text-2xl font-medium" data-testid="ProductElement_Price">
								{price}
							</p>
							{variants && (
								<VariantSelector
									selectedVariant={selectedVariant}
									variants={variants}
									product={product}
									channel={channel}
									onSelectVariant={(variant) => setSelectedVariantID(variant.id)}
								/>
							)}
							<AvailabilityMessage isAvailable={isAvailable} />
							<div className="mt-8">
								<AddButton disabled={!selectedVariantID || !selectedVariant?.quantityAvailable} />
							</div>
							{description && (
								<div className="mt-8 space-y-6 text-sm text-neutral-500">
									{description.map((content: string) => (
										<div key={content} dangerouslySetInnerHTML={{ __html: xss(content) }} />
									))}
								</div>
							)}
						</div>
					</div>
				</form>
			</section>
			<section className="mx-auto max-w-7xl p-8">
				<h2 className="mb-6 text-2xl font-semibold text-neutral-900">Related Products</h2>
				{relatedProducts && relatedProducts.edges && relatedProducts.edges.length > 0 ? (
					<ProductList products={relatedProducts.edges.map((e: any) => e.node)} />
				) : (
					<p className="text-neutral-500">No related products found.</p>
				)}
			</section>
		</>
	);
}
