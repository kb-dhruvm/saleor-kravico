"use client";
import { useState } from "react";

export function RegisterForm() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ firstName, lastName, email, password }),
			});
			const data: any = await res.json();
			if (!res.ok) throw new Error(data.message || "Registration failed");
			// Optionally redirect or show success
			window.location.href = data.redirectUrl || "/verify";
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mx-auto mt-16 w-full max-w-lg">
			<form className="rounded border p-8 shadow-md" onSubmit={handleSubmit}>
				<div className="mb-2">
					<label className="sr-only" htmlFor="firstName">
						First Name
					</label>
					<input
						type="text"
						name="firstName"
						placeholder="First Name"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
				</div>
				<div className="mb-2">
					<label className="sr-only" htmlFor="lastName">
						Last Name
					</label>
					<input
						type="text"
						name="lastName"
						placeholder="Last Name"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>
				<div className="mb-2">
					<label className="sr-only" htmlFor="email">
						Email
					</label>
					<input
						type="email"
						name="email"
						placeholder="Email"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div className="mb-4">
					<label className="sr-only" htmlFor="password">
						Password
					</label>
					<input
						type="password"
						name="password"
						placeholder="Password"
						autoCapitalize="off"
						autoComplete="off"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				{error && <div className="mb-2 text-red-600">{error}</div>}
				<button
					className="rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700"
					type="submit"
					disabled={loading}
				>
					{loading ? "Registering..." : "Register"}
				</button>
			</form>
		</div>
	);
}
