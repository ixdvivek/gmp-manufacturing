// GMP Manufacturing Ltd — Tailwind design tokens
//
// This site runs on the Tailwind Play CDN (no build step / no npm), so this
// file uses the CDN's runtime config format — a plain assignment to the
// `tailwind.config` global — rather than the `module.exports` format used
// by a compiled Tailwind CLI/PostCSS project. Loaded on every page via
// <script src="tailwind.config.js"></script> immediately after the CDN
// <script> tag.
//
// Brand palette, gradients and font stack were previously copy-pasted as
// local JS consts inside every page's renderVals() (`const red = "rgb(178,33,38)"`
// etc.), so a color change meant a find-and-replace across ~20 files. These
// are now named Tailwind theme values instead — e.g. bg-gmp-red, font-gmp —
// giving the palette one real source of truth.
tailwind.config = {
  theme: {
    extend: {
      screens: {
        // The desktop nav measures 1044px wide, so it can appear well before
        // the 1280px layout breakpoint. Without this, a 1366px laptop at the
        // usual 125% Windows scaling (~1093px CSS) falls back to the hamburger.
        nav: "1080px",
      },
      colors: {
        "gmp-red": "rgb(178,33,38)",
        "gmp-purple": "rgb(45,38,93)",
        "gmp-navy": "rgb(41,37,96)",
        "gmp-blue": "rgb(37,117,187)",
        "gmp-dark": "rgb(51,51,51)",
        "gmp-near": "rgb(17,17,17)",
      },
      backgroundImage: {
        "gmp-gradient": "linear-gradient(139.949deg, rgb(37,117,187) 3.69%, rgb(41,37,96) 58.52%, rgb(178,33,38) 137.9%)",
        "gmp-gradient-footer": "linear-gradient(111.131deg, rgb(37,117,187) -0.79%, rgb(41,37,96) 62.7%, rgb(178,33,38) 154.63%)",
      },
      fontFamily: {
        gmp: ["Geist", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      boxShadow: {
        "gmp-hover": "0 16px 32px -12px rgba(178,33,38,0.45)",
      },
    },
  },
};
