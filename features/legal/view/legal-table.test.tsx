import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SectionTable } from "../model/terms.types";
import { LegalTable } from "./legal-table";

describe("LegalTable", () => {
  const mockTable: SectionTable = {
    headers: ["Header A", "Header B"],
    rows: [
      ["Row 1 Col 1", "Row 1 Col 2"],
      ["Row 2 Col 1", "Row 2 Col 2"],
    ],
    note: "Sample table note",
  };

  it("renders table headers, rows, and optional note", () => {
    render(<LegalTable table={mockTable} />);

    expect(screen.getByText("Header A")).toBeInTheDocument();
    expect(screen.getByText("Header B")).toBeInTheDocument();
    expect(screen.getByText("Row 1 Col 1")).toBeInTheDocument();
    expect(screen.getByText("Row 1 Col 2")).toBeInTheDocument();
    expect(screen.getByText("Row 2 Col 1")).toBeInTheDocument();
    expect(screen.getByText("Row 2 Col 2")).toBeInTheDocument();
    expect(screen.getByText("Sample table note")).toBeInTheDocument();
  });

  it("renders without note if not provided", () => {
    const tableWithoutNote: SectionTable = {
      headers: ["Col 1", "Col 2"],
      rows: [["Cell 1", "Cell 2"]],
    };

    render(<LegalTable table={tableWithoutNote} />);

    expect(screen.getByText("Col 1")).toBeInTheDocument();
    expect(screen.getByText("Cell 1")).toBeInTheDocument();
  });
});
