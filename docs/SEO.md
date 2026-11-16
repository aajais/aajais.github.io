# Search visibility

Canonical site: https://aajais.github.io/

The homepage and About page use consistent name-focused metadata and a linked Person/ProfilePage JSON-LD graph. The homepage also declares the WebSite name. Professional profile links identify the same person; all expertise claims should remain grounded in visible content and docs/CONTENT.md.

## Search Console

Property: https://aajais.github.io/ (URL prefix).
The google-site-verification meta tag in index.html is the ownership token supplied by Google Search Console for the signed-in owner. Keep this tag when editing the head.

Sitemap: https://aajais.github.io/sitemap.xml
Maintain real lastmod dates when substantive page content changes. robots.txt permits crawling and points to this sitemap.

Use URL Inspection for the homepage and About page after major changes. Monitor indexing and Performance queries for Aayush Jaiswal, Aayush Jaiswal CoreWeave, and related role terms. Crawl requests and structured data do not guarantee indexing, placement, or rich results.

## External identity

Keep the website URL on LinkedIn, GitHub, Medium, Google Scholar, and speaker biographies consistent with the canonical site. Request relevant author/speaker pages to link to the portfolio where appropriate. Do not create artificial links or duplicate pages targeting name variants.

## Checks

Validate JSON-LD and local links after edits, and confirm canonical pages, robots.txt, sitemap.xml, and preview images return HTTP 200 after deployment. Keep key content in HTML so readers and crawlers can access it without JavaScript.

Guidance:
- https://developers.google.com/search/docs/appearance/structured-data/profile-page
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
