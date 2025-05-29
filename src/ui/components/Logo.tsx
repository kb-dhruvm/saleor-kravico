"use client";

import { usePathname } from "next/navigation";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import Image from "next/image";

export const Logo = () => {
	const pathname = usePathname();

	if (pathname === "/") {
		return (
			<h1 className="flex items-center font-bold" aria-label="homepage">
				<Image src="/logo.png" alt="logo" width={100} height={100} className="h-fit w-fit" />
			</h1>
		);
	}
	return (
		<div className="flex items-center font-bold">
			<LinkWithChannel aria-label="homepage" href="/">
				<Image src="/logo.png" alt="logo" width={100} height={100} className="h-fit w-fit" />
			</LinkWithChannel>
		</div>
	);
};
