# openHAB FormatKit Change Log

## [2.2.9] - 22.06.2026

- Documented the `Group:Number:COUNT(.*)` regex aggregation fix in the README.

## [2.2.8] - 22.06.2026

- Fixed parsing of openHAB Group aggregation functions with regex parameters, e.g. `Group:Number:COUNT(.*)`.
- Prevented aggregation names such as `COUNT` from being consumed as `Number` subtypes during item type parsing.

## [2.2.7] - 09.06.2026

- Replaced the standalone extension icon with artwork derived from the wordmark icon for a more detailed and consistent visual style.

## [2.2.6] - 09.06.2026

- Added an `openHAB FormatKit: Show Diagnostics` command and activation logging to the `openHAB FormatKit` output channel to troubleshoot formatter discovery issues.

## [2.2.5] - 09.06.2026

- Removed the what's-new activation path and commands to eliminate a possible activation failure before formatter registration.
- Restored language-based activation behavior closer to the last working pre-rename version while keeping the openHAB file-pattern formatter selectors.

## [2.2.4] - 09.06.2026

- Removed the `file` scheme restriction from formatter selectors so `.items`, `.sitemap`, and `.things` files are matched in local and remote workspaces such as SSH, WSL, and dev containers.
- Added unconditional activation fallback so the formatter provider is registered even when VS Code does not classify the file as `openhab` before activation.

## [2.2.3] - 09.06.2026

- Restored and expanded Marketplace discovery metadata for formatter/category searches, including `openhab`, `formatter`, `alignment`, and `aligner` keywords.
- Added `Programming Languages` category alongside `Formatters` so VS Code can surface the extension for openHAB file support and formatter searches.

## [2.2.2] - 09.06.2026

- Registered formatter providers with explicit file-pattern selectors for `*.items`, `*.sitemap`, and `*.things`, so VS Code can discover the formatter even when the document language mode is not already `openhab`.
- Added startup/workspace activation events for openHAB configuration files.

## [2.2.1] - 09.06.2026

- Added built-in openHAB language contribution for `.items`, `.sitemap`, and `.things` files so the formatter is available without relying on another extension to provide the `openhab` language id.
- Hardened activation so a what's-new page issue cannot prevent formatter registration.

## [2.2.0] - 09.06.2026

- Rebranded the extension to **openHAB FormatKit**.
- Changed Marketplace package identity to `openhab-formatkit` under the existing publisher account.
- Replaced the icon and README wordmark with newly created `formatkit` artwork.
- Rewrote README and extension messaging to state independent maintenance and no affiliation with the original project.
- Renamed install-facing settings and command IDs to the `openhab-formatkit.*` namespace.
- Removed old logo/example assets from the maintained project.
- Replaced README examples with reworked branded images.
- Cleaned Marketplace package contents to exclude development-only files.

## [2.1.10] - 01.05.2026

- Moved support and original-author credit links to the top of the Marketplace README overview.
- Added extension sponsor metadata for ongoing maintenance.

## [2.1.9] - 01.05.2026

- Updated Marketplace package identity for the maintained fork.
- Renamed install-facing settings and command IDs for the maintained fork.
- Added README notes for the maintained fork, fixed formatting bugs, and support links.

## [2.1.8] - 01.05.2026

- First community-maintained release after the original project went quiet in 2021.
- Continued the upstream package version from `2.1.7` to `2.1.8` instead of resetting to a year-based version.
- Renamed extension package and display name to avoid colliding with the unmaintained original Marketplace listing.

All notable changes to the openHAB FormatKit extension will be documented in this file.

## [2.1.6] - 30.04.2021

## Fixed

-    Fixed a bug where the "what's new" message is shown on every startup of the extension.

## [2.1.0] - 17.04.2021

## Added

-    Added the welcome and what's-new page as a pop-up.

## Fixed

-    Fixed a lot of bugs regarding special formatting features for the \*.items files.

## [2.0.0] - 21.07.2020

## Changed

-    Implemented the Visual-Studio-Code formatter API. The extension is now a proper formatting tool and can use all the formatting functions integrated in the standard vsc installation (Like format-on-save, etc.).

## Fixed

-    Fixed a lot of bugs regarding special formatting features for the \*.items files.

## [1.3.11] - 01.03.2020

## Added

-    Added the formatting for sitemap files.

## [1.3.10] - 20.02.2020

## Added

-    Added new formatting style "ChannelColumn".

## [1.3.5] - 03.11.2019

## Fixed

-    Fixed bug for german umlauts in item type definitions
-    Fixed bug for items in the first line of a item file.

## [1.3.4] - 31.10.2019

### Added

-    Commands at teh end of an item are not deleted anymore

## [1.3.3] - 27.10.2019

### Added

-    Tool is now able to support all function with space and tab indentation.

## [1.3.2] - 27.10.2019

### Added

-    Restore multiline indenting style from multiline formatting extension

## [1.3.1] - 27.10.2019

### Changed

-    Fixed error in the package.json which prevented the correct execution of the npm scripts.
-    Fixed error which deleted item line after a comment line.

## [1.3.0] - 27.10.2019

### Added

-    Added support for the multiline formatting style of [Mark Hilbush's Extension](https://github.com/mhilbush/openhab-formatter). Credits to Mark for a great extension and functionality. After having a chat about our extensions we joined forces and grouped them together in one extension.
-    Added style configuration option
-    Added option to preserve existing whitespaces in front of items
-    Added option to insert new lines after each item

### Changed

-    Changed some VSC Marketplace parameters
-    Changed internal function and method structure to add some performance.

## [1.0.7] - 18.10.2019

### Added

-    Added support for cmnd/ctrl+a+l keybinding.

### Changed

-    Changed internal function name. Conflict with formatting extension of Mark Hilbush.

## [1.0.6] - 13.10.2019

### Added

-    Added support for multiline (line-by-line) item-definition files. They will be decoded and written into one line for the column formatting style. [#2]

## [1.0.5] - 11.10.2019

### Added

-    Added support for tabs or spaces in front of items. [#1]
-    Added support for group functions like OR(ON, OFF) or AVG, SUM, etc.

### Changed

-    Name of the app. Confusion with tool of Mark Hilbush. Sorry Mark ;)

## [1.0.4] - 11.10.2019

### Added

-    Support for space indentation in VSC.

## [1.0.0] - 11.10.2019

### Added

-    Initial upload of the project.
