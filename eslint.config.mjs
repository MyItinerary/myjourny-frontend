import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ---------------------------------------------------------------------------
// MVVM boundary rules — see CONTRIBUTING.md ("Architecture").
// Changing anything in this section requires @MyItinerary/frontend-leads or
// @MyItinerary/engineering-manager approval (CODEOWNERS).
//
// Flat config does not merge `no-restricted-imports` across blocks — a later
// block replaces the rule entirely — so every layer re-declares the global
// "no deep imports into another feature" pattern via `restrict()`.
// ---------------------------------------------------------------------------

const DEEP_FEATURE_IMPORT = {
  group: ["@/features/*/**"],
  message:
    "Import a feature only through its public index (`@/features/<feature>`). Inside a feature, use relative imports.",
};

const DATA_ACCESS = [
  {
    group: ["axios", "@/lib/api-client"],
    message: "Only the model layer (features/*/model) may talk to the API.",
  },
];

const restrict = (...patterns) => [
  "error",
  { patterns: [DEEP_FEATURE_IMPORT, ...patterns] },
];

const mvvmBoundaries = [
  {
    name: "mvvm/global",
    files: ["**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": restrict() },
  },
  {
    name: "mvvm/model",
    files: ["features/*/model/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict({
        group: [
          "sonner",
          "next/navigation",
          "@/components/**",
          "**/view",
          "**/view/**",
          "**/view-model",
          "**/view-model/**",
        ],
        message:
          "The model layer is UI-free: no toasts, routing, components, views or view-models. Surface errors to the view-model instead.",
      }),
    },
  },
  {
    name: "mvvm/view-model",
    files: ["features/*/view-model/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict(...DATA_ACCESS, {
        group: ["**/view", "**/view/**"],
        message: "A view-model must not import views. Views consume view-models, not the other way round.",
      }),
    },
  },
  {
    name: "mvvm/view",
    files: ["features/*/view/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict(...DATA_ACCESS, {
        group: ["@tanstack/react-query", "**/model/**", "!**/model/*.types"],
        message:
          "Views are presentational. Get data and handlers from the view-model via props; shared types may come from `../model/*.types`.",
      }),
    },
  },
  {
    name: "mvvm/routes",
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict(...DATA_ACCESS, {
        group: ["@tanstack/react-query"],
        message:
          "Routes are thin wiring: call a feature's view-model hook and render its view. No data hooks in app/.",
      }),
    },
  },
  {
    name: "mvvm/lib",
    files: ["lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict({
        group: ["@/components/**", "@/features/**"],
        message: "lib/ is shared infrastructure and must not depend on components or features.",
      }),
    },
  },
  {
    // Legacy ratchet: these files pre-date the MVVM standard. They are allowed
    // to keep their current violations as warnings until migrated. This list
    // may only SHRINK — never add a file to it.
    name: "mvvm/legacy-allowlist",
    files: [
      "lib/mock-data/home.ts",
      "lib/queries/experiences.ts",
      "lib/onboarding/preference-options.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            DEEP_FEATURE_IMPORT,
            { group: ["@/components/**", "@/features/**"], message: "Legacy violation — migrate this file." },
          ],
        },
      ],
    },
  },
  {
    // Legacy ratchet: pre-existing `set-state-in-effect` errors on main when
    // this standard landed. Downgraded to warnings for THESE FILES ONLY so CI
    // can be required from day one. Shrink-only — fix and remove, never add.
    name: "legacy/set-state-in-effect-allowlist",
    files: [
      "app/profile/preferences/budget/content.tsx",
      "app/profile/preferences/energy/content.tsx",
      "app/profile/preferences/interests/content.tsx",
      "app/profile/preferences/social/content.tsx",
      "app/profile/preferences/vibe/content.tsx",
      "components/account settings/preferences-view.tsx",
      "components/home/home-nav.tsx",
      "components/home/search-bar.tsx",
      "components/onboarding/pill-question-screen.tsx",
      "components/ui/carousel.tsx",
      "lib/hooks/use-geolocation.ts",
    ],
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  {
    name: "mvvm/view-size",
    files: ["features/*/view/**/*.tsx"],
    rules: {
      "max-lines": ["warn", { max: 250, skipBlankLines: true, skipComments: true }],
    },
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...mvvmBoundaries,
  {
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
