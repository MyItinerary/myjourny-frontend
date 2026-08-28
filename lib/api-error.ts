// FastAPI's error `detail` is a plain string for a normal HTTPException, but
// a 422 validation error returns an ARRAY of Pydantic error objects
// ({ type, loc, msg, input }) instead — passing that straight to toast.error
// crashes the app (React can't render a raw object/array as a child).
export function apiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
    ?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item && typeof item === "object" && "msg" in item ? String(item.msg) : null))
      .filter((msg): msg is string => !!msg);
    if (messages.length > 0) return messages.join(", ");
  }

  return fallback;
}
