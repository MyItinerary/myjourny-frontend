import { Button } from "@/components/ui/button";

import type { BookingReviewViewModel } from "../view-model/use-booking-review-view-model";
import { StarRow } from "./star-row";

/** On a completed booking: leave a review, or see (and for 14 days, edit) the one you left. */
export function BookingReviewView(props: BookingReviewViewModel) {
  if (props.mode === "hidden") return null;

  if (props.mode === "posted") {
    return (
      <section id="review" className="mt-8 rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-sans text-lg font-bold text-[#130404]">Your review</h2>
          {props.onEdit && (
            <Button variant="outline" size="sm" onClick={props.onEdit}>
              Edit
            </Button>
          )}
        </div>
        <div className="mt-3">
          <StarRow rating={props.rating} />
        </div>
        {props.comment && <p className="mt-3 whitespace-pre-line text-[#333134]">{props.comment}</p>}
        <p className="mt-3 text-sm text-[#6F6B72]">Posted {props.date}</p>
        {props.isHidden && (
          <p className="mt-2 text-sm text-[#6F6B72]">
            MyJourny has hidden this review from the experience page.
          </p>
        )}
      </section>
    );
  }

  return (
    <section id="review" className="mt-8 rounded-2xl border border-border p-6">
      <h2 className="font-sans text-lg font-bold text-[#130404]">
        {props.editing ? "Edit your review" : "How was it?"}
      </h2>
      <p className="mt-1 text-sm text-[#6F6B72]">Your review helps other travellers choose.</p>
      <div className="mt-4">
        <StarRow rating={props.rating} onRate={props.onRate} size="lg" />
      </div>
      <label className="mt-4 block text-sm font-medium text-[#130404]" htmlFor="review-comment">
        Tell others about it (optional)
      </label>
      <textarea
        id="review-comment"
        value={props.comment}
        onChange={(event) => props.onComment(event.target.value)}
        maxLength={props.maxLength}
        rows={4}
        placeholder="What did you enjoy? Anything others should know?"
        className="mt-2 w-full rounded-xl border border-border p-3 text-sm text-[#130404] outline-none focus:border-[#130404]"
      />
      <div className="mt-4 flex gap-3">
        <Button size="cta" disabled={!props.canSubmit} onClick={props.onSubmit}>
          {props.saving ? "Saving…" : props.editing ? "Save changes" : "Post review"}
        </Button>
        {props.onCancel && (
          <Button variant="outline" size="cta" onClick={props.onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </section>
  );
}
