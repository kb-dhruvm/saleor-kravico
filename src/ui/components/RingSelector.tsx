import { VariantDetailsFragment } from "@/gql/graphql";
import { useState, useMemo } from "react";

const RingSelector = ({
	modifiedVariants,
	variants,
	onSelectVariant,
}: {
	modifiedVariants: {
		id: string;
		attributes: {
			name: string | null | undefined;
			slug: string | null | undefined;
			values: {
				slug: string | null | undefined;
				value: string | null | undefined;
				name: string | null | undefined;
			}[];
		}[];
	}[];
	variants: VariantDetailsFragment[];
	onSelectVariant: (variant: VariantDetailsFragment) => void;
}) => {
	console.log(modifiedVariants);
	const groupByCarat = useMemo(() => {
		const map = {};
		for (const variant of modifiedVariants) {
			const attrs = Object.fromEntries(variant.attributes.map((a) => [a.slug, a.values]));
			const carat = attrs.carat?.[0]?.slug;
			if (!carat) continue;

			if (!map[carat]) map[carat] = [];

			map[carat].push({
				variantId: variant.id,
				karat: attrs.karat?.[0]?.slug,
				color: attrs.color?.[0],
				sizes: attrs.size?.map((s) => s.name),
			});
		}
		return map;
	}, [modifiedVariants]);

	const caratOptions = Object.keys(groupByCarat);
	const [selectedCarat, setSelectedCarat] = useState(caratOptions[0]);
	const [variantIndex, setVariantIndex] = useState(0);

	const availableVariants = groupByCarat[selectedCarat];
	const selectedVariant = availableVariants[variantIndex];

	onSelectVariant(variants.find((v) => v.id === selectedVariant.variantId) || variants[0]);

	const [selectedSize, setSelectedSize] = useState("");

	const handleCaratChange = (carat) => {
		setSelectedCarat(carat);
		setVariantIndex(0);
		setSelectedSize("");
	};

	return (
		<div className="max-w-md space-y-6">
			{/* Metal Section */}
			<div>
				<div className="mb-1 text-sm font-semibold">METAL</div>
				<div className="flex gap-2">
					{availableVariants.map((v, index) => (
						<button
							key={index}
							onClick={() => setVariantIndex(index)}
							className={`rounded border p-2 text-sm ${
								index === variantIndex ? "border-black" : "border-gray-300"
							}`}
							style={{ backgroundColor: v.color?.value || "#fff" }}
							title={v.color?.slug.replace(/-/g, " ")}
						>
							{v.karat}K
						</button>
					))}
				</div>
			</div>

			{/* Carat Section */}
			<div>
				<div className="mb-1 text-sm font-semibold">CARAT</div>
				<div className="flex gap-2">
					{caratOptions.map((carat) => (
						<button
							key={carat}
							onClick={() => handleCaratChange(carat)}
							className={`h-10 w-10 rounded border text-sm ${
								selectedCarat === carat ? "border-black" : "border-gray-300"
							}`}
						>
							{carat}
						</button>
					))}
				</div>
			</div>

			{/* Ring Size Section */}
			<div>
				<div className="mb-1 text-sm font-semibold">RING SIZE</div>
				<div className="flex items-center gap-4">
					<select
						value={selectedSize}
						onChange={(e) => setSelectedSize(e.target.value)}
						className="rounded border px-4 py-2 text-sm"
					>
						<option value="">SELECT SIZE</option>
						{selectedVariant?.sizes?.map((size) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>
					<a href="#" className="text-sm font-semibold underline">
						FIND RING SIZE
					</a>
				</div>
			</div>
		</div>
	);
};

export default RingSelector;
