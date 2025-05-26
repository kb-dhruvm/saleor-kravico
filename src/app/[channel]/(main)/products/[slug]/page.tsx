import { notFound } from "next/navigation";
import { type ResolvingMetadata, type Metadata } from "next";
import { ProductDetailsDocument, ProductListDocument, RelatedProductsDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import ProductPageClient from "./ProductPageClient";
import { addItemToCart } from "@/actions/cart.actions";

export async function generateMetadata(
	props: {
		params: Promise<{ slug: string; channel: string }>;
		searchParams: Promise<{ variant?: string }>;
	},
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const [searchParams, params] = await Promise.all([props.searchParams, props.params]);

	const { product } = await executeGraphQL(ProductDetailsDocument, {
		variables: {
			slug: decodeURIComponent(params.slug),
			channel: params.channel,
		},
		revalidate: 60,
	});

	if (!product) {
		notFound();
	}

	const productName = product.seoTitle || product.name;
	const variantName = product.variants?.find(({ id }) => id === searchParams.variant)?.name;
	const productNameAndVariant = variantName ? `${productName} - ${variantName}` : productName;

	return {
		title: `${product.name} | ${product.seoTitle || (await parent).title?.absolute}`,
		description: product.seoDescription || productNameAndVariant,
		alternates: {
			canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
				? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/products/${encodeURIComponent(params.slug)}`
				: undefined,
		},
		openGraph: product.thumbnail
			? {
					images: [
						{
							url: product.thumbnail.url,
							alt: product.name,
						},
					],
				}
			: null,
	};
}

export async function generateStaticParams({ params }: { params: { channel: string } }) {
	const { products } = await executeGraphQL(ProductListDocument, {
		revalidate: 60,
		variables: { first: 20, channel: params.channel },
		withAuth: false,
	});

	const paths = products?.edges.map(({ node: { slug } }) => ({ slug })) || [];
	return paths;
}

export default async function Page(props: { params: Promise<{ slug: string; channel: string }> }) {
	const params = await props.params;
	const { product } = await executeGraphQL(ProductDetailsDocument, {
		variables: {
			slug: decodeURIComponent(params.slug),
			channel: params.channel,
		},
		revalidate: 60,
	});

	console.log(product?.attributes);

	const relatedProductsIds = (product?.attributes
		.map(
			({ values }) =>
				values.filter(({ inputType }) => inputType === "REFERENCE")?.map(({ reference }) => reference),
		)
		.flat() ?? []) as string[];

	const { products: relatedProducts } = await executeGraphQL(RelatedProductsDocument, {
		variables: {
			ids: relatedProductsIds,
			channel: params.channel,
			first: 3,
		},
	});

	if (!product) {
		notFound();
	}

	return (
		<ProductPageClient
			product={product}
			channel={params.channel}
			addItemAction={addItemToCart}
			relatedProducts={relatedProducts}
		/>
	);
}
