# Visual Studio Marketplace Review Evidence

Extension: `openhab-formatkit` under the existing publisher account
Display name: **openHAB FormatKit**
Review issue: impersonation concern

## Summary

The extension has been rebranded so it is clearly distinct from the inactive original project and does not imply affiliation, endorsement, or publication by the original author.

## Changes applied

- Changed the extension package name to `openhab-formatkit`.
- Changed the Marketplace display name to **openHAB FormatKit**.
- Replaced the extension icon with newly created artwork:
  - `images/formatkit-icon.svg`
  - `images/formatkit-icon.png`
- Replaced the README wordmark with newly created artwork:
  - `images/formatkit-wordmark.svg`
  - `images/formatkit-wordmark.png`
- Removed old logo assets from the maintained project:
  - `images/logo.png`
  - `images/logo.svg`
  - `images/logo_text.png`
  - `images/logo_text.svg`
  - `images/vscode-oh-alignment-tool-logo-readme.png`
- Rewrote the README introduction and attribution section to clearly state:
  - this is independently maintained,
  - it is not affiliated with or endorsed by the original project or author,
  - the original open-source project is credited only for transparent attribution.
- Replaced the old README example screenshots/GIFs with reworked, branded `formatkit-*` example images.
- Removed original-author donation/support UI from the extension and kept attribution in the README only.
- Renamed commands and settings to the new namespace `openhab-formatkit.*`.
- Updated in-extension what's-new/messaging text to the new brand.
- Added a `2.2.0` changelog entry documenting the rebrand.

## Files changed for proof

- `package.json`
- `package-lock.json`
- `README.md`
- `CHANGELOG.md`
- `src/extension.ts`
- `src/contentProvider.ts`
- `images/formatkit-icon.svg`
- `images/formatkit-icon.png`
- `images/formatkit-wordmark.svg`
- `images/formatkit-wordmark.png`
- `images/formatkit-items-column.png`
- `images/formatkit-items-channel-column.png`
- `images/formatkit-items-multiline.png`
- `images/formatkit-sitemap-formatting.png`
- `images/formatkit-new-group-tag.png`
- `images/formatkit-format-style-tag.png`

## Verification

- TypeScript compile completed successfully with `npm run compile`.
- VSIX packaging completed successfully with `npx --yes @vscode/vsce package --no-dependencies`.
- VSIX package now excludes development-only files such as GitHub templates, Azure pipeline config, quickstart notes, and the review evidence document.
- Search for the previous package identity and old logo references returns no matches outside historical attribution/removal evidence text.

## Note for Marketplace support

Because the publisher account is blocked, the Marketplace listing itself cannot be updated directly yet. These repository changes are ready for review and can be published to the Marketplace once Microsoft temporarily reinstates publisher access or advises an alternative upload/review path.
