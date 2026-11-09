import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { BookingCancellationViewModel } from "../view-model/use-booking-cancellation-view-model";

const TONE = {
  neutral: "bg-[#F4F2EE] text-[#130404]",
  good: "bg-green-50 text-green-900",
  bad: "bg-red-50 text-red-900",
};

export function BookingCancellationView({
  policyText,
  estimate,
  outcome,
  canRequest,
  unpaid,
  formOpen,
  reason,
  canSubmit,
  sending,
  onOpenForm,
  onCloseForm,
  onReason,
  onSubmit,
}: BookingCancellationViewModel) {
  const action = unpaid ? "Cancel booking" : "Request cancellation";
  return (
    <section className="mt-6 rounded-2xl border border-border p-6">
      <h2 className="font-sans text-lg font-bold text-[#130404]">Cancellation policy</h2>

      {estimate && (
        <div className="mt-3 rounded-xl border border-[#E0DFDD] p-4 text-sm" data-testid="refund-estimate">
          <p className="font-semibold text-[#130404]">{estimate.title}</p>
          {estimate.detail && <p className="mt-1 text-[#6F6B72]">{estimate.detail}</p>}
          {estimate.breakdown.length > 0 && (
            <dl className="mt-3 flex flex-col gap-1">
              {estimate.breakdown.map((row) => (
                <div key={row.label} className="flex justify-between">
                  <dt className="text-[#6F6B72]">{row.label}</dt>
                  <dd className="font-medium text-[#130404]">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      <p className="mt-3 whitespace-pre-line text-sm text-[#130404]">{policyText}</p>
      <p className="mt-3 text-xs text-[#6F6B72]">
        This is the policy shown when you booked. MyJourny support reviews every cancellation request against it
        and decides any refund.
      </p>

      {outcome && (
        <div className={cn("mt-5 rounded-xl p-4 text-sm", TONE[outcome.tone])} role="status">
          <p className="font-medium">{outcome.title}</p>
          <p className="mt-1 opacity-80">{outcome.body}</p>
        </div>
      )}

      {canRequest &&
        (formOpen ? (
          <form
            className="mt-5 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <label htmlFor="cancel-reason" className="text-sm font-medium text-[#130404]">
              Why do you want to cancel?
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => onReason(e.target.value)}
              rows={3}
              maxLength={2000}
              className="rounded-xl border border-[#E0DFDD] p-3 text-sm"
              placeholder="e.g. My plans changed"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={!canSubmit} className="bg-[#2C0101] text-white hover:bg-[#2C0101]/90">
                {sending ? "Sending…" : action}
              </Button>
              <Button type="button" variant="outline" onClick={onCloseForm}>
                Keep my booking
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" className="mt-5" onClick={onOpenForm}>
            {outcome ? "Ask again" : action}
          </Button>
        ))}
    </section>
  );
}
