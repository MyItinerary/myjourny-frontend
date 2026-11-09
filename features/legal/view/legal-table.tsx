"use client";

import type { SectionTable } from "../model/terms.types";
import { FormattedText } from "./formatted-text";

export interface LegalTableProps {
  table: SectionTable;
}

export function LegalTable({ table }: LegalTableProps) {
  return (
    <div className="my-6">
      <div className="overflow-x-auto rounded-xl border border-[#EBEBEB] bg-white">
        <table className="w-full text-left font-sans text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#EBEBEB] bg-[#FAF9F7]">
              {table.headers.map((header, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className="px-4 py-3.5 font-bold text-[#130404] sm:px-5"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {table.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#FAF9F7]/50 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-4 py-3.5 align-top leading-relaxed text-[#333134] sm:px-5"
                  >
                    <FormattedText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note && (
        <p className="mt-3 font-sans text-xs text-[#6F6B72]">
          <FormattedText text={table.note} />
        </p>
      )}
    </div>
  );
}
