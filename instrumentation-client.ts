import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (projectToken) {
  posthog.init(projectToken, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    defaults: "2026-08-30",
    autocapture: false,
    capture_pageview: "history_change",
    capture_pageleave: false,
    disable_session_recording: true,
    cookieless_mode: "always",
    person_profiles: "identified_only",
    before_send: (event) => {
      if (!event?.properties) return event;

      const properties = { ...event.properties };
      for (const key of ["$current_url", "$initial_current_url", "$referrer", "$initial_referrer"]) {
        const value = properties[key];
        if (typeof value !== "string") continue;

        try {
          const url = new URL(value, window.location.origin);
          properties[key] = `${url.origin}${url.pathname}`;
        } catch {
          delete properties[key];
        }
      }

      return { ...event, properties };
    },
  });
}
