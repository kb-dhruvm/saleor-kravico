import { notFound } from "next/navigation";
import { ProductFiltersDocument, ProductListPaginatedDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { Pagination } from "@/ui/components/Pagination";
import { ProductList } from "@/ui/components/ProductList";
import { ProductsPerPage } from "@/app/config";
import { FiltersUI } from "./FiltersUI";

export const metadata = {
	title: "Products · Saleor Storefront example",
	description: "All products in Saleor Storefront example",
};

export default async function Page(props: {
	params: Promise<{ channel: string }>;
	searchParams: Promise<{
		cursor: string | string[] | undefined;
	}>;
}) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;

	const { products } = await executeGraphQL(ProductListPaginatedDocument, {
		variables: {
			first: ProductsPerPage,
			after: cursor,
			channel: params.channel,
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

	console.log(availableFilters);

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
			<ProductList products={products.edges.map((e) => e.node)} />
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
