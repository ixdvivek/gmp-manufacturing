/* =============================================================================
   LinkedIn feed — shared by the homepage strip and linkedin.html.

   ## Wiring this to the admin backend

   Point LINKEDIN_FEED_URL below at the endpoint once it exists. Nothing else
   has to change, provided the response matches the shape in
   linkedin-posts.json:

     { "posts": [ { url, image, imageAlt, heading, date, description }, … ] }

   `date` is an ISO date (YYYY-MM-DD) and is formatted for display here, so the
   backend never has to care how dates are presented. A cross-origin endpoint
   needs to send Access-Control-Allow-Origin for the site's domain.

   Until then the URL points at the committed placeholder file, whose contents
   are invented and must be replaced with real posts before launch.

   ## Why a fetch rather than posts written into the page

   LinkedIn has no public endpoint for a company's posts — reading them needs
   OAuth and Marketing Developer Platform approval, and the API cannot be called
   from a browser. So the posts cannot be live-fetched here no matter what. With
   an admin backend on the way, fetching a feed it controls is the arrangement
   that needs the least rework later: this file changes by one constant.

   ## Behaviour

   Pages render POSTS_FALLBACK immediately, then swap in fetched posts if the
   request succeeds. A failed or slow request therefore leaves the section
   populated rather than empty or half-built — worth more on a marketing page
   than showing nothing at all.
   ============================================================================= */
(function () {
  "use strict";

  var LINKEDIN_FEED_URL = "linkedin-posts.json";

  // Mirrors the first entries of linkedin-posts.json so the strip has something
  // to draw before — or instead of — a successful fetch. Placeholder copy.
  var POSTS_FALLBACK = [
    {
      url: "https://www.linkedin.com/company/gmp-manufacturing-ltd/",
      image: "assets2/news-1-real.webp",
      imageAlt: "Preparations underway ahead of a healthcare exhibition",
      heading: "Behind the scenes of our exhibition build",
      date: "2026-08-11",
      description: "The team has been prepping the stand all week — a look at what goes into getting a GMP-compliant display ready to travel."
    },
    {
      url: "https://www.linkedin.com/company/gmp-manufacturing-ltd/",
      image: "assets2/news-2-real.webp",
      imageAlt: "Packaging line at the Hull facility",
      heading: "Five ways we tightened our packaging setup",
      date: "2026-08-04",
      description: "From tube line changeovers to labelling accuracy, small adjustments across the line added up to a measurable gain this quarter."
    },
    {
      url: "https://www.linkedin.com/company/gmp-manufacturing-ltd/",
      image: "assets2/news-3-real.webp",
      imageAlt: "Discussion between healthcare and formulation specialists",
      heading: "What clinicians want from formulation in 2026",
      date: "2026-07-28",
      description: "We sat down with practitioners to hear where product design still falls short, and what that means for the briefs we take on."
    },
    {
      url: "https://www.linkedin.com/company/gmp-manufacturing-ltd/",
      image: "assets2/placeholder-sector-pharma.jpg",
      imageAlt: "Capsules moving along a production line",
      heading: "Scaling from 20L to 6 tonnes under one roof",
      date: "2026-07-19",
      description: "Tech transfer without a third-party handoff changes the risk profile of a scale-up. Here is how we run it in practice."
    }
  ];

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Absolute rather than relative ("2 weeks ago"): the page is static and can be
  // cached for a long time, so a relative label silently becomes wrong.
  function formatDate(iso) {
    if (!iso) return "";
    var parts = String(iso).slice(0, 10).split("-");
    if (parts.length !== 3) return String(iso);
    var y = +parts[0], m = +parts[1], d = +parts[2];
    if (!y || !m || !d || m < 1 || m > 12) return String(iso);
    return d + " " + MONTHS[m - 1] + " " + y;
  }

  function normalise(list) {
    if (!list || !list.length) return [];
    return list.filter(function (p) { return p && p.heading; }).map(function (p) {
      return {
        url: p.url || "https://www.linkedin.com/company/gmp-manufacturing-ltd/",
        image: p.image || "",
        imageAlt: p.imageAlt || p.heading || "",
        heading: p.heading || "",
        date: p.date || "",
        dateLabel: formatDate(p.date),
        description: p.description || ""
      };
    });
  }

  // limit: how many to return (the homepage shows 4, the listing page shows all).
  // onPosts is called once with the fallback and again only if a fetch improves on it.
  function load(onPosts, limit) {
    var cut = function (list) { return limit ? list.slice(0, limit) : list; };
    onPosts(cut(normalise(POSTS_FALLBACK)));
    if (typeof fetch !== "function") return;
    fetch(LINKEDIN_FEED_URL, { credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var posts = normalise(data && (data.posts || data));
        if (posts.length) onPosts(cut(posts));
      })
      .catch(function () { /* keep the fallback; the section stays populated */ });
  }

  window.gmpLinkedInFeed = { load: load, formatDate: formatDate, url: LINKEDIN_FEED_URL };
})();
