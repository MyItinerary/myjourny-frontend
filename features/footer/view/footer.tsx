"use client";

import { useFooterViewModel } from "../view-model/use-footer-view-model";
import { FooterView } from "./footer-view";

// The footer is shared by many pages, so it wires its own view-model.
export function Footer() {
  const vm = useFooterViewModel();
  return <FooterView {...vm} />;
}
