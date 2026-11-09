import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegisteredBusinessIcon } from "./registered-business-icon";

describe("RegisteredBusinessIcon", () => {
  it("renders SVG with default white stroke", () => {
    const { container } = render(<RegisteredBusinessIcon />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("stroke", "white");
  });

  it("renders SVG with custom stroke color", () => {
    const { container } = render(<RegisteredBusinessIcon stroke="#6F6B72" />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("stroke", "#6F6B72");
  });
});
