export function ValuePropsSection() {
  return (
    <section className="w-full bg-[#2C0101] py-20 text-white sm:py-28">
      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-8">
        {/* Section Header */}
        <h2 className="text-center font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Keep 85% of every booking.
          <br />
          Get paid the next day.
        </h2>

        {/* 3 Tilted Cards */}
        <div className="mt-16 grid grid-cols-1 items-start justify-items-center gap-12 sm:mt-24 md:grid-cols-3 md:gap-8">
          {/* Card 1: Transparent fee pricing */}
          <div className="flex flex-col items-center">
            <div
              style={{
                borderRadius: "28px",
                background: "linear-gradient(135deg, #6B3A2E 0%, #6B3A2E 100%)",
                boxShadow: "0 14px 30px 0 rgba(0, 0, 0, 0.35)",
                width: "280px",
                height: "244.7px",
                transform: "rotate(-4deg)",
              }}
              className="relative flex items-start justify-start p-6"
            >
              <div
                style={{
                  borderRadius: "14px",
                  background: "#DDE5EE",
                  boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.30)",
                  transform: "rotate(-12deg)",
                  padding: "8px 14px",
                }}
                className="inline-flex items-center justify-center"
              >
                <span className="font-sans text-xs font-bold text-[#130404] sm:text-sm">
                  You keep 85%
                </span>
              </div>
            </div>

            <h3 className="mt-8 text-center font-sans text-xl font-bold text-white">
              Transparent fee pricing
            </h3>
            <p className="mt-2 max-w-[280px] text-center font-sans text-sm leading-relaxed text-[#D9D4CC]">
              We take 15%, published. Processing fees come out of our share, not yours.
            </p>
          </div>

          {/* Card 2: 24h payout */}
          <div className="flex flex-col items-center">
            <div
              style={{
                borderRadius: "28px",
                background: "linear-gradient(135deg, #6B3A2E 0%, #6B3A2E 100%)",
                boxShadow: "0 14px 30px 0 rgba(0, 0, 0, 0.35)",
                width: "280px",
                height: "280px",
                transform: "rotate(3deg)",
              }}
              className="relative flex items-start justify-start p-6"
            >
              <div
                style={{
                  borderRadius: "14px",
                  background: "#DDE5EE",
                  boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.30)",
                  transform: "rotate(-12deg)",
                  padding: "8px 14px",
                }}
                className="inline-flex items-center justify-center"
              >
                <span className="font-sans text-xs font-bold text-[#130404] sm:text-sm">
                  Paid in 24h
                </span>
              </div>
            </div>

            <h3 className="mt-8 text-center font-sans text-xl font-bold text-white">
              24h payout
            </h3>
            <p className="mt-2 max-w-[280px] text-center font-sans text-sm leading-relaxed text-[#D9D4CC]">
              Your payout lands 24 hours after your experience ends.
            </p>
          </div>

          {/* Card 3: Nothing hidden */}
          <div className="flex flex-col items-center">
            <div
              style={{
                borderRadius: "28px",
                background: "linear-gradient(135deg, #6B3A2E 0%, #6B3A2E 100%)",
                boxShadow: "0 14px 30px 0 rgba(0, 0, 0, 0.35)",
                width: "280px",
                height: "280px",
                transform: "rotate(-3deg)",
              }}
              className="relative flex items-start justify-end p-6"
            >
              <div
                style={{
                  borderRadius: "14px",
                  background: "#F5032D",
                  boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.30)",
                  transform: "rotate(8deg)",
                  padding: "8px 14px",
                }}
                className="inline-flex items-center justify-center"
              >
                <span className="font-sans text-xs font-bold text-white sm:text-sm">
                  No paid placement
                </span>
              </div>
            </div>

            <h3 className="mt-8 text-center font-sans text-xl font-bold text-white">
              Nothing hidden
            </h3>
            <p className="mt-2 max-w-[280px] text-center font-sans text-sm leading-relaxed text-[#D9D4CC]">
              Free to list, always. You can never pay to rank higher.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
