import { ImagePlus, Upload, X } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { StepHeading } from "./host-builder-parts";

type Props = { vm: HostListingBuilderViewModel };

/** Slots shown before any photo is added: the minimum a listing needs. */
const MIN_SLOTS = 4;

const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

export function StepPhotos({ vm }: Props) {
  const { draft, photos, onAddPhotos, onReorderPhoto, onDeletePhoto, onField, uploading } = vm;
  const fileId = useId();
  // Which photo is being dragged, and whether files are being dragged over the upload area.
  const [dragging, setDragging] = useState<number | null>(null);
  const [filesOver, setFilesOver] = useState(false);
  const empties = Math.max(MIN_SLOTS - photos.length, photos.length >= MIN_SLOTS ? 1 : 0);
  const pick = (files: FileList | null) => onAddPhotos(Array.from(files ?? []));

  return (
    <div>
      <StepHeading badge="Required" title="Photos" />
      <div
        onDragOver={(e) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          setFilesOver(true);
        }}
        onDragLeave={() => setFilesOver(false)}
        onDrop={(e) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          setFilesOver(false);
          pick(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl bg-white p-5 shadow-[inset_0_0_0_1px_#E7E7E7]",
          filesOver && "bg-[#FAF9F7] shadow-[inset_0_0_0_2px_#F5032D]",
        )}
      >
        <div className="mb-1.5 flex flex-wrap items-center justify-center gap-2.5">
          <label
            htmlFor={fileId}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-[#333134] shadow-[inset_0_0_0_1px_#333134] hover:bg-[#F4F2EE]"
          >
            <Upload aria-hidden className="size-4" />
            Upload photos
          </label>
          <span className="text-sm text-[#333134]">or drag photos here</span>
          <input
            id={fileId}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            aria-label="Upload photos"
            className="sr-only"
            onChange={(e) => {
              pick(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mb-4 text-center text-xs text-[#6F6B72]">
          {uploading > 0 ? `Uploading ${uploading}…` : "JPG or PNG · Up to 10 MB each · At least 4 photos"}
        </p>

        <ul aria-label="Your photos" className="grid grid-cols-2 gap-2.5">
          {photos.map((src, i) => (
            <li
              key={src}
              draggable
              tabIndex={0}
              aria-label={`${i === 0 ? "Main photo" : `Photo ${i + 1}`}. Drag to change the order, or use the left and right arrow keys.`}
              onDragStart={(e) => {
                setDragging(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => setDragging(null)}
              onDragOver={(e) => {
                if (dragging === null) return;
                e.preventDefault();
              }}
              onDrop={(e) => {
                if (dragging === null) return;
                e.preventDefault();
                e.stopPropagation();
                onReorderPhoto(dragging, i);
                setDragging(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") onReorderPhoto(i, i - 1);
                if (e.key === "ArrowRight") onReorderPhoto(i, i + 1);
              }}
              className={cn(
                "relative aspect-[4/3] cursor-grab overflow-hidden rounded-[14px] bg-[#F4F2EE] focus-visible:shadow-[0_0_0_3px_rgba(245,3,45,0.25)] focus-visible:outline-none active:cursor-grabbing",
                dragging === i && "opacity-50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a photo the host just uploaded */}
              <img src={src} alt={i === 0 ? "Main photo" : `Photo ${i + 1}`} draggable={false} className="size-full object-cover" />
              {i === 0 && <span className="absolute right-2 bottom-2 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-medium text-[#333134]">Main photo</span>}
              <button
                type="button"
                aria-label={`Remove ${i === 0 ? "main photo" : `photo ${i + 1}`}`}
                onClick={() => onDeletePhoto(i)}
                className="absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-white/95 hover:bg-white"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
          {Array.from({ length: empties }, (_, i) => (
            <li key={`empty-${i}`}>
              <label
                htmlFor={fileId}
                className="relative flex aspect-[4/3] cursor-pointer items-center justify-center rounded-[14px] bg-[#F4F2EE] hover:bg-[#EEEBE5]"
              >
                <ImagePlus aria-hidden className="size-9 text-[#A09DA3]" strokeWidth={1.5} />
                <span className="sr-only">Add a photo</span>
                {photos.length === 0 && i === 0 && (
                  <span className="absolute right-2 bottom-2 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-medium text-[#333134]">Main photo</span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#FAF9F7] p-4 shadow-[inset_0_0_0_1px_#E9E1D2]">
        <input
          type="checkbox"
          checked={draft.photoRightsAgreed}
          onChange={(e) => onField("photoRightsAgreed", e.target.checked)}
          className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-[#F5032D]"
        />
        <span className="text-[13px] leading-relaxed text-[#333134]">
          These are my photos, or I have permission to use them, and everyone you can recognise in them has agreed to be shown.
          They don&apos;t use anyone else&apos;s logos, trademarks or images without permission, and I&apos;m responsible if they
          do. Read our{" "}
          <Link href="/legal/hosts" target="_blank" className="font-medium text-[#F5032D] underline underline-offset-2">
            host terms
          </Link>
          .
        </span>
      </label>
    </div>
  );
}
