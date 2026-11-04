import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TermsParagraph } from "../model/terms.types";
import { TermsParagraphItem } from "./terms-paragraph-item";

describe("TermsParagraphItem", () => {
  it("renders number, boldPrefix, and text", () => {
    const item: TermsParagraph = {
      number: "1.1",
      boldPrefix: "Notice.",
      text: "This is a paragraph.",
    };

    render(<TermsParagraphItem item={item} />);

    expect(screen.getByText("1.1")).toBeInTheDocument();
    expect(screen.getByText("Notice.")).toBeInTheDocument();
    expect(screen.getByText("This is a paragraph.")).toBeInTheDocument();
  });

  it("renders string bullets and bullet items", () => {
    const item: TermsParagraph = {
      text: "Intro text",
      bullets: [
        "Plain bullet string",
        {
          boldPrefix: "Prefixed:",
          text: "Bullet with prefix",
        },
      ],
    };

    render(<TermsParagraphItem item={item} />);

    expect(screen.getByText("Plain bullet string")).toBeInTheDocument();
    expect(screen.getByText("Prefixed:")).toBeInTheDocument();
    expect(screen.getByText("Bullet with prefix")).toBeInTheDocument();
  });
});
