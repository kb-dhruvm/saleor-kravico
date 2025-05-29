import { notFound } from "next/navigation";
import { ProductFiltersDocument, ProductListPaginatedDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { Pagination } from "@/ui/components/Pagination";
import { ProductList } from "@/ui/components/ProductList";
import { ProductsPerPage } from "@/app/config";
import { FiltersUI } from "./FiltersUI";
import { isEmpty } from "lodash-es";

export const metadata = {
	title: "Products · Saleor Storefront example",
	description: "All products in Saleor Storefront example",
};

export default async function Page(props: {
	params: Promise<{ channel: string }>;
	searchParams: Promise<{
		cursor: string | string[] | undefined;
		color: string | undefined;
		gender: string | undefined;
		karat: string | undefined;
		metal: string | undefined;
		carat: string | undefined;
		shape: string | undefined;
		styles: string | undefined;
	}>;
}) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;

	const attributeNames: ["color", "gender", "karat", "metal", "carat", "shape", "styles"] = [
		"color",
		"gender",
		"karat",
		"metal",
		"carat",
		"shape",
		"styles",
	];

	const attributes = attributeNames
		.map((name) => {
			const value = searchParams[name];
			const values = value?.split(",").filter((v) => v !== "");
			return values && values.length > 0 ? { slug: name, values } : null;
		})
		.filter(Boolean);

	const { products } = await executeGraphQL(ProductListPaginatedDocument, {
		variables: {
			first: ProductsPerPage,
			after: cursor,
			channel: params.channel,
			where: isEmpty(attributes) ? {} : { attributes },
		},
		revalidate: 60,
	});

	if (!products) {
		notFound();
	}

	const Filters = await executeGraphQL(ProductFiltersDocument, {
		revalidate: 60,
	});

	const availableFilters = Filters.attributes?.edges.map((attrEdge) => {
		const { name, slug, choices } = attrEdge?.node;
		return {
			name,
			slug,
			values: choices?.edges.map((choiceEdge) => {
				const { name, slug } = choiceEdge?.node;
				return { name, slug };
			}),
		};
	});

	const newSearchParams = new URLSearchParams({
		...(products.pageInfo.endCursor && { cursor: products.pageInfo.endCursor }),
	});

	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			{availableFilters && (
				<>
					<h2 className="mb-4 text-2xl font-bold">Filters</h2>
					<FiltersUI availableFilters={availableFilters} />
				</>
			)}
			<h2 className="sr-only">Product list</h2>
			<ProductList products={products.edges.map((e) => e.node)} channel={params.channel} />
			<Pagination
				pageInfo={{
					...products.pageInfo,
					basePathname: `/products`,
					urlSearchParams: newSearchParams,
				}}
			/>
		</section>
	);
}
