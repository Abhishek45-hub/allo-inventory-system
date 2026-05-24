import { AppProvider } from "@/providers/app-provider";
import { render, screen } from "@testing-library/react";

describe("Products page wiring", () => {
	it("loads provider tree", () => {
		render(
			<AppProvider>
				<div>Products</div>
			</AppProvider>,
		);

		expect(screen.getByText("Products")).toBeInTheDocument();
	});
});
