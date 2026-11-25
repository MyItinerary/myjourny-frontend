import type { LaunchScreenViewModel } from "../view-model/use-launch-screen-view-model";

/**
 * The installed app's launch screen: white, the MyJourny logo pulsing in the middle, like the
 * sign-in loader. It is in the server HTML so it covers the page from the first paint, and CSS
 * shows it only in the installed app (`display-mode: standalone`); in a browser tab it never
 * appears. It fades away once the first page is ready.
 */
export function LaunchScreenView({ ready }: LaunchScreenViewModel) {
  return (
    <div
      data-testid="launch-screen"
      data-ready={ready}
      aria-hidden
      className="launch-screen fixed inset-0 z-[100] hidden items-center justify-center bg-white transition-[opacity,visibility] duration-200 ease-out data-[ready=true]:invisible data-[ready=true]:opacity-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- must show before hydration, without the image optimiser */}
      <img src="/logo/myjourny-logo.svg" alt="" width={188} height={40} className="launch-screen-logo h-10 w-auto object-contain" />
    </div>
  );
}
