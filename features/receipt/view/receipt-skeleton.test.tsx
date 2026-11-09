import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReceiptSkeleton } from "./receipt-skeleton";

describe("ReceiptSkeleton", () => {
  it("renders multiple skeleton blocks", () => {
    const { container } = render(<ReceiptSkeleton />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(5);
  });
});
