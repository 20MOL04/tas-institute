"use client";

import { useEffect, useState } from "react";
import { SITE_CHANGED, SITE_DEFAULTS, readSiteContent, type SiteContent } from "./siteStore";

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(SITE_DEFAULTS);

  useEffect(() => {
    function refresh() {
      setContent(readSiteContent());
    }
    refresh();
    window.addEventListener(SITE_CHANGED, refresh);
    return () => window.removeEventListener(SITE_CHANGED, refresh);
  }, []);

  return content;
}
