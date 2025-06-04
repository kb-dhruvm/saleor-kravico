"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useMemo } from "react";
import { apiErrorMessages } from "../errorMessages";
import { CheckoutForm } from "./stripeElementsForm";
import { stripeGatewayId } from "./types";
import { useTransactionInitializeMutation } from "@/checkout/graphql";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useErrorMessages } from "@/checkout/hooks/useErrorMessages";
import { useCheckout } from "@/checkout/hooks/useCheckout";

export const StripeComponent = ({ config }: { config: { data: { stripePublishableKey: string } } }) => {
	const { checkout } = useCheckout();

	const [transactionInitializeResult, transactionInitialize] = useTransactionInitializeMutation();
	const stripeData = transactionInitializeResult.data?.transactionInitialize?.data as
		| undefined
		| {
				paymentIntent: {
					stripeClientSecret: string;
				};
				publishableKey: string;
		  };

	const { showCustomErrors } = useAlerts();
	const { errorMessages: commonErrorMessages } = useErrorMessages(apiErrorMessages);

	useEffect(() => {
		transactionInitialize({
			checkoutId: checkout.id,
			paymentGateway: {
				id: stripeGatewayId,
				data: {
					paymentIntent: {
						paymentMethod: "card",
					},
				},
			},
		}).catch((err) => {
			console.error(err);
			showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
		});
	}, [checkout.id, commonErrorMessages.somethingWentWrong, showCustomErrors, transactionInitialize]);

	const stripePromise = useMemo(
		() => loadStripe(config.data.stripePublishableKey),
		[config.data.stripePublishableKey],
	);

	if (!stripePromise || !config.data.stripePublishableKey || !stripeData) {
		return null;
	}

	return (
		<Elements
			options={{ clientSecret: stripeData.paymentIntent.stripeClientSecret, appearance: { theme: "stripe" } }}
			stripe={stripePromise}
		>
			<CheckoutForm />
		</Elements>
	);
};
