"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";
import { useSubscribeNewsletter } from "@/lib/queries/newsletter";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Figma: "HERO" newsletter block (2353:19077 desktop / 2353:19093 mobile),
// replacing the old "CTA" section.
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: subscribe, isPending } = useSubscribeNewsletter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    subscribe(
      { email: email.trim(), source: "web_home" },
      {
        onSuccess: () => {
          toast.success("You're subscribed. Check your inbox!");
          setEmail("");
        },
        onError: (err) => toast.error(apiErrorMessage(err, "Couldn't subscribe. Please try again.")),
      }
    );
  };

  return (
    <section className="relative bg-gradient-to-b from-[rgba(244,242,238,0.87)] to-white">
      <div className="mx-auto flex w-full max-w-[1056px] flex-col items-center justify-center gap-16 px-6 py-8 lg:min-h-[426px] lg:flex-row lg:gap-12 xl:gap-[83px] xl:px-0">
        <div className="relative aspect-[1448/1086] w-full shrink-0 overflow-hidden rounded-xl border border-[#dedede] bg-[#FDFCF8] lg:w-[433.8px]">
          <Image
            src="/images/home/newsletter/newsletter-envelope.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 434px, 345px"
            className="object-cover"
          />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-5 lg:max-w-[540px] lg:flex-1">
          <h2 className="font-heading text-[32px] font-extrabold leading-[1.2] text-[#333134] lg:text-[40px]">
            One email.
            <br />
            Always worth opening.
          </h2>
          <p className="text-base leading-6 text-[#6F6B72] lg:text-xl lg:leading-[30px]">
            New experiences, local favorites, and the occasional early-access deal, picked by people who actually
            know the city.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 lg:flex-row">
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                aria-label="Email address"
                aria-invalid={!!error}
                aria-describedby={error ? "newsletter-email-error" : undefined}
                className={cn(
                  "h-12 w-full rounded-full border bg-white px-4 text-base font-medium text-[#212121] placeholder:text-[#BDBDBD] focus:outline-none focus:ring-2 focus:ring-[#F5032D]/30 lg:flex-1",
                  error ? "border-[#F5032D]" : "border-[#E0E0E0]"
                )}
              />
              <button
                type="submit"
                disabled={isPending}
                className="h-12 w-full cursor-pointer rounded-full bg-[#F5032D] px-4 text-base font-medium text-white transition-colors hover:bg-[#d90227] disabled:cursor-wait disabled:opacity-70 lg:w-[141px] lg:shrink-0"
              >
                {isPending ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {error && (
              <p id="newsletter-email-error" className="px-4 text-sm text-[#F5032D]">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
      <div aria-hidden className="mx-auto h-0 w-full max-w-[1329px] border-b border-dashed border-[#E0E0E0]" />
    </section>
  );
}
