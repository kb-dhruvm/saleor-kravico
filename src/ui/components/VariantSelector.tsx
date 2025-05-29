import { redirect } from "next/navigation";
import { type ProductListItemFragment, type VariantDetailsFragment } from "@/gql/graphql";
import { getHrefForVariant } from "@/lib/utils";
import RingSelector from "./RingSelector";

export function VariantSelector({
	variants,
	product,
	selectedVariant,
	channel,
	onSelectVariant,
}: {
	variants: VariantDetailsFragment[];
	product: ProductListItemFragment;
	selectedVariant?: VariantDetailsFragment;
	channel: string;
	onSelectVariant?: (variant: VariantDetailsFragment) => void;
}) {
	if (!selectedVariant && variants.length === 1 && variants[0]?.quantityAvailable) {
		redirect("/" + channel + getHrefForVariant({ productSlug: product.slug, variantId: variants[0].id }));
	}

	const transformedVariants = variants.map(({ attributes, id }) => ({
		id,
		attributes: attributes.map((attr) => ({
			name: attr.attribute.name,
			slug: attr.attribute.slug,
			values: attr.values.map((val) => ({
				slug: val.slug,
				value: val.value,
				name: val.name,
			})),
		})),
	}));

	return (
		variants.length > 1 && (
			<fieldset className="my-4" role="radiogroup" data-testid="VariantSelector">
				<legend className="sr-only">Variants</legend>
				<div className="flex flex-wrap gap-3">
					{onSelectVariant && (
						<RingSelector
							modifiedVariants={transformedVariants}
							onSelectVariant={onSelectVariant}
							variants={variants}
						/>
					)}
				</div>
			</fieldset>
		)
	);
}
