import type { SVGProps } from "react";

// Inlined from public/icons/*.svg (real Figma exports) so `stroke="currentColor"`
// can inherit color via className, which an <img>/next/image src can't do.

export function UmbrellaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22.0016 22.0019" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.25 20.9612L11 11.0019M16 2.34164C11.6868 -0.148575 6.28964 0.939519 3.246 4.68483C2.94893 5.05039 2.80039 5.23317 2.75718 5.49505C2.7228 5.70341 2.77373 5.97954 2.88018 6.16193C3.01398 6.39116 3.25111 6.52807 3.72539 6.8019L18.2746 15.2019C18.7489 15.4757 18.986 15.6126 19.2514 15.6139C19.4626 15.6149 19.7272 15.5209 19.8905 15.387C20.0957 15.2186 20.1797 14.9986 20.3477 14.5585C22.0695 10.05 20.3132 4.83186 16 2.34164ZM16 2.34164C14.0868 1.23707 10.2973 4.21897 7.5359 9.0019M16 2.34164C17.9132 3.44621 17.2255 8.21897 14.4641 13.0019M21 21.0019H1"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScalesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22.0001 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M21 13V12.8498C21 12.5333 21 12.3751 20.9758 12.2209C20.9543 12.084 20.9187 11.9497 20.8694 11.8202C20.814 11.6743 20.7354 11.5369 20.5784 11.2622L17 5L5.00004 7L1.42166 13.2622C1.26464 13.5369 1.18613 13.6743 1.13066 13.8202C1.0814 13.9497 1.04574 14.084 1.02425 14.2209C1.00004 14.3751 1.00004 14.5333 1.00004 14.8498V15M1.00004 15C1.00004 17.2091 2.7909 19 5.00004 19C7.20918 19 9.00004 17.2091 9.00004 15M1.00004 15V14.8C1.00004 14.52 1.00004 14.38 1.05454 14.273C1.10248 14.1789 1.17897 14.1024 1.27305 14.0545C1.38 14 1.52002 14 1.80004 14H8.20004C8.48007 14 8.62008 14 8.72704 14.0545C8.82112 14.1024 8.89761 14.1789 8.94555 14.273C9.00004 14.38 9.00004 14.52 9.00004 14.8V15M5.00004 7L8.57842 13.2622C8.73544 13.5369 8.81396 13.6743 8.86943 13.8202C8.91868 13.9497 8.95434 14.084 8.97584 14.2209C9.00004 14.3751 9.00004 14.5333 9.00004 14.8498V15M13 13V12.8498C13 12.5333 13 12.3751 13.0243 12.2209C13.0457 12.084 13.0814 11.9497 13.1307 11.8202C13.1861 11.6743 13.2646 11.5369 13.4217 11.2622L17 5M13 13C13 15.2091 14.7909 17 17 17C19.2092 17 21 15.2091 21 13M13 13V12.8C13 12.52 13 12.38 13.0545 12.273C13.1025 12.1789 13.179 12.1024 13.273 12.0545C13.38 12 13.52 12 13.8 12H20.2C20.4801 12 20.6201 12 20.727 12.0545C20.8211 12.1024 20.8976 12.1789 20.9455 12.273C21 12.38 21 12.52 21 12.8V13M11 1V6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M21 11H19M21 11C21 16.5228 16.5228 21 11 21M21 11C21 5.47715 16.5228 1 11 1M18.0711 18.0711L16.6569 16.6569M3 11H1M1 11C1 16.5228 5.47715 21 11 21M1 11C1 5.47715 5.47715 1 11 1M5.34315 5.34315L3.92893 3.92893M11 3V1M16.6569 5.34315L18.0711 3.92893M11 21V19M3.92893 18.0711L5.34315 16.6569M11 7L15 11L11 15L7 11L11 7Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ZapFastIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22.0283 20.0002" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8 15.5001H2.5M5.5 10.0001H1M8 4.50008H3M16 1.00008L9.40357 10.2351C9.1116 10.6438 8.96562 10.8482 8.97194 11.0186C8.97744 11.167 9.04858 11.3052 9.1661 11.3959C9.30108 11.5001 9.55224 11.5001 10.0546 11.5001H15L14 19.0001L20.5964 9.76508C20.8884 9.35633 21.0344 9.15195 21.0281 8.98156C21.0226 8.8332 20.9514 8.69497 20.8339 8.60427C20.6989 8.50008 20.4478 8.50008 19.9454 8.50008H15L16 1.00008Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 13L1 7L7 1"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
