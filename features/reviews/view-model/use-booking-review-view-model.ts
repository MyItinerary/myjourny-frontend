import { useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import { MAX_COMMENT_LENGTH, isEditable, reviewDate, useBookingReview, useSaveReview } from "../model/reviews";

type BookingForReview = {
  id: string;
  status: string;
  experience_id?: string | null;
};

export type BookingReviewViewModel =
  | { mode: "hidden" }
  | {
      mode: "form";
      editing: boolean;
      rating: number;
      comment: string;
      maxLength: number;
      canSubmit: boolean;
      saving: boolean;
      onRate: (stars: number) => void;
      onComment: (text: string) => void;
      onSubmit: () => void;
      onCancel: (() => void) | null;
    }
  | {
      mode: "posted";
      rating: number;
      comment: string | null;
      date: string;
      isHidden: boolean;
      onEdit: (() => void) | null;
    };

/** "How was it?" on a booking page. Only completed bookings can be reviewed;
 * the traveller can change their review for 14 days. */
export function useBookingReviewViewModel(booking: BookingForReview | null | undefined): BookingReviewViewModel {
  const completed = booking?.status === "completed";
  const status = useBookingReview(booking?.id ?? "", completed);
  const save = useSaveReview(booking?.id ?? "", booking?.experience_id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);

  const review = status.data?.review ?? null;

  if (!booking || !completed || !status.data) return { mode: "hidden" };
  if (!review && !status.data.can_review) return { mode: "hidden" };

  if (review && !editing) {
    return {
      mode: "posted",
      rating: review.rating,
      comment: review.comment ?? null,
      date: reviewDate(review.created_at),
      isHidden: review.is_hidden,
      onEdit: isEditable(review)
        ? () => {
            setRating(review.rating);
            setComment(review.comment ?? "");
            setEditing(true);
          }
        : null,
    };
  }

  const onSubmit = () => {
    if (rating < 1 || save.isPending) return;
    save.mutate(
      { input: { rating, comment }, reviewId: review?.id },
      {
        onSuccess: () => {
          toast.success(review ? "Review updated" : "Thanks for your review");
          setEditing(false);
        },
        onError: (error) => toast.error(apiErrorMessage(error, "We couldn't save your review. Try again.")),
      },
    );
  };

  return {
    mode: "form",
    editing: !!review,
    rating,
    comment,
    maxLength: MAX_COMMENT_LENGTH,
    canSubmit: rating >= 1 && !save.isPending,
    saving: save.isPending,
    onRate: setRating,
    onComment: (text) => setComment(text.slice(0, MAX_COMMENT_LENGTH)),
    onSubmit,
    onCancel: review ? () => setEditing(false) : null,
  };
}
