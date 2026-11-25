export interface CtaSectionProps {
  onStartApplication: () => void;
}

export function CtaSection({ onStartApplication }: CtaSectionProps) {
  return (
    <section className="w-full bg-[#2C0101] py-20 text-center text-white sm:py-28 lg:py-32">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center px-4 sm:px-8">
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.12]">
          Start making money off
          <br />
          what you already do
        </h2>

        <button
          type="button"
          onClick={onStartApplication}
          className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-8 py-3.5 font-sans text-sm font-bold text-[#2C0101] shadow-md transition-all hover:scale-105 hover:bg-[#FAF9F7] sm:mt-10 sm:px-10 sm:py-4 sm:text-base"
        >
          Start your application
        </button>
      </div>
    </section>
  );
}
