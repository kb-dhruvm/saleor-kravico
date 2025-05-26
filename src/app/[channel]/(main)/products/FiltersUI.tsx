"use client";

import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";

interface Filter {
	name: string | null | undefined;
	slug: string | null | undefined;
	values:
		| {
				name: string | null | undefined;
				slug: string | null | undefined;
		  }[]
		| undefined;
}
[];

export const FiltersUI = ({ availableFilters }: { availableFilters: Filter[] }) => {
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const handleDropdown = (slug: string) => {
		setOpenDropdown(openDropdown === slug ? null : slug);
	};

	return (
		<nav className="mb-8 flex gap-6 border-b border-gray-200">
			{availableFilters?.map((filter) => (
				<div key={filter.slug} className="relative">
					<button
						className="flex items-center gap-1 px-2 py-2 text-lg font-semibold uppercase tracking-wide hover:text-black focus:outline-none"
						onClick={() => handleDropdown(filter.slug)}
						type="button"
					>
						{filter.name}
						{openDropdown === filter.slug ? (
							<ChevronUpIcon className="h-4 w-4" />
						) : (
							<ChevronDownIcon className="h-4 w-4" />
						)}
					</button>
					{openDropdown === filter.slug && (
						<div className="absolute left-0 z-10 mt-2 flex w-48 flex-col gap-2 rounded bg-white p-4 shadow-lg">
							{filter.values?.map((value) => (
								<label key={value.slug} className="flex cursor-pointer items-center gap-2 text-base">
									<input type="checkbox" className="h-4 w-4 accent-black" />
									<span className="uppercase">{value.name}</span>
								</label>
							))}
						</div>
					)}
				</div>
			))}
		</nav>
	);
};
