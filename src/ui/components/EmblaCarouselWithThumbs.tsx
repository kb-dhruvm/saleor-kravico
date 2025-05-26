"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ProductImageWrapper } from "../atoms/ProductImageWrapper";

// Embla Carousel with Thumbnails
export default function EmblaCarouselWithThumbs({ slides }: { slides: { url: string; alt?: string }[] }) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
	const [thumbsApi, setThumbsApi] = useState<any>(null);
	const thumbsRef = useRef<HTMLDivElement>(null);

	// Sync main carousel with thumbnail clicks
	const scrollTo = useCallback(
		(idx: number) => {
			if (emblaApi) emblaApi.scrollTo(idx);
		},
		[emblaApi],
	);

	// Sync selected index
	useEffect(() => {
		if (!emblaApi) return;
		const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
		emblaApi.on("select", onSelect);
		onSelect();
		return () => {
			if (emblaApi) emblaApi.off("select", onSelect);
		};
	}, [emblaApi]);

	return (
		<div>
			<div className="embla overflow-hidden rounded-lg" ref={emblaRef}>
				<div className="embla__container flex">
					{slides.map((img, idx) => (
						<div className="embla__slide min-w-0 flex-[0_0_100%]" key={img.url}>
							<ProductImageWrapper
								src={img.url}
								alt={img.alt ?? ""}
								width={1024}
								height={1024}
								priority={idx === 0}
							/>
						</div>
					))}
				</div>
			</div>
			<div className="embla-thumbs mt-4 flex gap-2" ref={thumbsRef}>
				{slides.map((img, idx) => (
					<button
						key={img.url}
						type="button"
						className={`overflow-hidden rounded border p-0.5 transition-all ${
							selectedIndex === idx ? "border-neutral-900" : "border-transparent"
						}`}
						style={{ outline: selectedIndex === idx ? "2px solid #000" : undefined }}
						onClick={() => scrollTo(idx)}
						aria-label={`Show image ${idx + 1}`}
					>
						<ProductImageWrapper src={img.url} alt={img.alt ?? ""} width={80} height={80} priority={false} />
					</button>
				))}
			</div>
		</div>
	);
}
