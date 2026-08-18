# openHAB FormatKit Change Log

## [2.14.5] - 18.08.2026

- Updated repository, bugs, homepage, and author links after renaming the GitHub repository to `openHAB-FormatKit`.

## [2.14.4] - 18.08.2026

- Restored the Buy Me a Coffee support link alongside Manuel Miethe's PayPal donation link.

## [2.14.3] - 18.08.2026

- Added Manuel Miethe's PayPal donation link to README support links, GitHub funding metadata, VS Code extension sponsor metadata, and the extension description.
- Removed the Buy Me a Coffee support link in favor of the PayPal donation link.

## [2.14.2] - 07.07.2026

- Fixed structured formatter comment spacing for `.rules`, `.script`, and `.things` files.
- Standalone comments such as `//This is a comment` are normalized to `// This is a comment`.
- Inline comments such as `sendCommand(X, ON)//Comment` are normalized to `sendCommand(X, ON) // Comment`.
- Comment detection continues to ignore `//` inside quoted strings such as URLs.

## [2.14.1] - 03.07.2026

- Hardened the native RRD Inspector webview with a Content Security Policy and per-render script/style nonce.
- Added validation for datasource/archive/row indexes before writing RRD edits.
- Added stale-file protection: saving is blocked if the `.rrd` changed on disk after the inspector loaded it.
- Avoided creating backups for empty save attempts.
- Improved backup filename precision to reduce collisions.
- Added a safe empty-state message for RRD files without datasource/archive data.

## [2.14.0] - 03.07.2026

- Added a native VS Code custom editor for `*.rrd` files: **openHAB RRD Inspector**.
- The inspector runs without Java and parses rrd4j binary files directly in Node/TypeScript.
- Added datasource/archive selection and a table with row, raw ring-buffer index, timestamp, date, and value.
- Added editing of existing archive values and timestamp-to-row mapping for adding/updating values inside the selected archive range.
- Added automatic `.formatkit-backup-YYYYMMDDHHMMSS` backup creation before writing edited RRD values.
- Supports rrd4j `version 0.1` array layout and `version 0.2` matrix layout for archive values.

## [2.13.2] - 02.07.2026

- Fixed `.items` formatting for Group aggregation functions with nested parentheses in regex parameters, e.g. `Group:Number:COUNT(^([0-9]|[1-9][0-9])$)`.
- Replaced the fragile item-type regex parser with a scanner that reads item type tokens until whitespace while respecting nested parentheses and quoted strings.
- Preserved support for dimensioned Group Number types such as `Group:Number:Temperature:AVG(...)`.

## [2.13.1] - 27.06.2026

- Restored README support links for Buy Me a Coffee and the original developer PayPal donation link.
- Restored VS Code sponsor metadata pointing to the Buy Me a Coffee support page.

## [2.13.0] - 26.06.2026

- Added context-aware `.items` icon suggestions inside item icon references such as `<water>`.
- Expanded the Classic Icon suggestions from the openHAB Web UI Classic Icon Set source list, including icons such as `water`, `temperature`, `battery`, `heating`, `window`, `door`, and many more.
- Added icon source prefix suggestions such as `oh:`, `material:`, `f7:`, `if:`, and `iconify:` for explicit icon references.
- Removed icon suggestions from the broad `.items` line-start completion list so they only appear where useful, primarily inside `<...>`.

## [2.12.2] - 25.06.2026

- Fixed `.items` metadata parsing for escaped JSON strings such as `initializeDefaultState="{\"presets\":[{\"id\":...}]}"` so the metadata block is no longer dropped during formatting.
- Replaced regex-only metadata block detection with a scanner that understands quoted strings and escaped quotes.
- Improved `.items` completions for dimensioned Group Number types: `Group:Number:` now offers Number dimensions such as `Temperature` as well as aggregation functions, while `Group:Number:Temperature:` offers only aggregation functions.
- Suppressed incorrect broad suggestions after complete dimension types such as `Number:Temperature:`.

## [2.12.1] - 25.06.2026

- Improved `.items` metadata formatting for JSON-like string values.
- Escaped inner double quotes in metadata values, e.g. `initializeDefaultState="{\"presets\":...}"`, are now normalized to single quotes inside the value: `initializeDefaultState="{'presets':...}"`.
- Updated channel/metadata splitting to tolerate escaped quotes inside metadata values.

## [2.12.0] - 25.06.2026

- Improved `.items` completion context filtering.
- Typing `Number:` or partial values such as `Number:T` now suggests only useful Number dimensions such as `Temperature`, `Power`, `Energy`, and `Dimensionless`.
- Typing `Group:` now suggests only valid Group base Item types.
- Typing `Group:Number:` or partial values such as `Group:Number:C` now suggests only Group aggregation functions such as `COUNT`, `AVG`, `SUM`, etc.
- Suppressed broad Item suggestions after the cursor has moved past the Item type/name area.

## [2.11.1] - 24.06.2026

- Fixed the sitemap formatter element splitter so it also recognizes `Buttongrid`, `Button`, `Input`, and `Colortemperaturepicker` elements.
- Removed unused legacy Thing formatter model files left over from the old formatter path.
- Removed unused legacy What's New helper files from the package source tree.

## [2.11.0] - 24.06.2026

- Removed the obsolete `openhab-formatkit.enableBetaFeatures` setting.
- Sitemap formatting is now available directly instead of being hidden behind the beta flag.
- Changed `openhab-formatkit.minimumIndentAmount` default from `4` to `2`.
- Removed the unused legacy `.things` column formatter path and its stale internal `multilineIndentAmount` reference.
- Updated settings documentation to describe the remaining active `.items` formatter settings more accurately.

## [2.10.2] - 24.06.2026

- Replaced the activity bar TreeViewer icon with a VS Code activity-bar-safe monochrome SVG, matching the original TreeView extension icon style.

## [2.10.1] - 24.06.2026

- Added a dedicated openHAB tree-view activity bar icon for the FormatKit Outline/TreeViewer.

## [2.10.0] - 24.06.2026

- Added `.items` diagnostics for direct and indirect Group membership cycles.
- Group cycle diagnostics now catch self-membership such as `Group gA ... (gA)`.
- Group cycle diagnostics now catch indirect cycles such as `gA -> gB -> gC -> gA`.
- Group membership parsing ignores quoted labels and avoids treating Group aggregation functions such as `Group:Number:COUNT(...)` as group membership.

## [2.9.1] - 23.06.2026

- Fixed `.items` semantic diagnostics when an Item label contains a state-format block such as `"Temperature [%.1f °C]"` before the semantic tag block.
- Diagnostics now scan all quoted tag blocks before the channel configuration instead of only the first `[...]` block on the line.
- Diagnostic ranges now point at the exact offending tag occurrence instead of always selecting the first matching text on the line.
- Fixed the Semantic Point Item completion choice from invalid `Number:Number` to `Number`.

## [2.9.0] - 23.06.2026

- Added local `.items` diagnostics for common semantic model mistakes.
- Diagnostics now warn about duplicate tags on one Item.
- Diagnostics now warn about multiple semantic tags from the same category on one Item, e.g. two Location tags or two Point tags.
- Diagnostics now warn about mixed primary semantic roles on one Item, e.g. Location + Equipment or Equipment + Point.
- Diagnostics now warn about Property tags without a Point tag, e.g. `Temperature` without `Measurement`.

## [2.8.0] - 23.06.2026

- Added openHAB Semantic Model suggestions for Location, Equipment, Point, and Property tags.
- Added `.items` snippets for semantic Location Groups, Equipment Groups, Point Items, light models, temperature measurements, and battery badge points.
- Added Rules DSL semantic action suggestions such as `isLocation`, `isEquipment`, `isPoint`, `getLocation`, `getEquipment`, `getPointType`, `getPropertyType`, and `getSemanticType`.
- Semantic tag data was derived from the openHAB Core semantic tag model.

## [2.7.0] - 23.06.2026

- Added local suggestions for openHAB transformation files under `transform/*.map` and `transform/*.scale`.
- Added local suggestions for openHAB service configuration files under `services/*.cfg`.
- Added common openHAB classic icon suggestions for Item and Sitemap contexts.
- Added transformation usage suggestions for Item/Sitemap labels and Rules DSL `transform(...)` calls.
- Added Rules DSL multimedia/voice action suggestions such as `playSound`, `playStream`, `say`, `interpret`, and volume helpers.
- Added workspace activation coverage for transform and services configuration files without globally claiming generic `.map` or `.cfg` files.

## [2.6.0] - 23.06.2026

- Added local code completion suggestions for openHAB textual configuration files.
- `.items` suggestions now include Item types, common `Number:<dimension>` examples, Group aggregation functions, and Item/channel-link snippets.
- `.things` suggestions now include `Bridge`, `Thing`, `Channels`, `Type`, `State`, implicit state, and `Trigger` channel snippets.
- `.rules` and `.script` suggestions now include rule skeletons, common trigger snippets, and common Actions such as `sendCommand`, `postUpdate`, and `createTimer`.
- `.sitemap` suggestions now include Sitemap element keywords and common widget snippets.
- `.persist` suggestions now include section snippets, predefined strategies, and common persistence keywords.

## [2.5.2] - 23.06.2026

- Fixed `.things` support for implicit state channel definitions without the `State` keyword, e.g. `String : stationName`.
- The `.things` formatter now aligns implicit state channels together with `Type`, `State`, and `Trigger` channels.
- The `.things` outline now lists implicit state channels as `State` channels.

## [2.5.1] - 23.06.2026

- Extended `.things` channel formatting from `Type` channels to `Type`, `State`, and `Trigger` channel definitions.
- Extended the `.things` outline to show `Type`, `State`, and `Trigger` channels with clearer descriptions.
- Added missing Sitemap outline element types such as `Buttongrid`, `Button`, `Input`, and `Colortemperaturepicker`.
- Added `.persist` outline support for `Strategies`, `Filters`, `Items`, and `Aliases` sections.
- Added workspace activation coverage for `.persist` files.

## [2.5.0] - 23.06.2026

- Added a local `openHAB FormatKit` outline TreeView in the activity bar.
- The outline parses the active file without requiring an openHAB REST connection.
- `.items` outline lists Items, including complex Group item types.
- `.rules` and `.script` outline lists rules, imports, and global variables.
- `.things` outline lists Bridges, Things, and Channels.
- `.sitemap` outline lists sitemap elements.
- Added outline refresh and go-to-source behavior.

## [2.4.1] - 23.06.2026

- Improved `.things` formatting for common Bridge/Thing/Type channel blocks.
- Joins standalone `{` lines after `Bridge`/`Thing` declarations.
- Aligns consecutive `Type ... : ...` channel lines by channel type, channel id, label, parameters, and comments.
- Normalizes channel parameter spacing and line comments such as `]//03` to `] // 03`.

## [2.4.0] - 23.06.2026

- Added conservative structured formatting for `.things`, `.rules`, and `.script` files.
- `.things` and `.script` formatting now normalizes indentation around braces and brackets while preserving line structure.
- `.rules` formatting now understands openHAB DSL `rule`, `when`, `then`, and `end` blocks and combines that with brace indentation.
- Added activation coverage for `.rules` and `.script` workspaces.

## [2.3.0] - 22.06.2026

- Added openHAB DSL syntax highlighting for `.items`, `.rules`, `.sitemap`, `.script`, `.things`, and `.persist` files.
- Added openHAB snippets for items, rules, rule design patterns, rule type conversions, and sitemaps.
- Added attribution notice for grammar and snippet definitions adapted from the official openHAB VS Code extension under EPL-2.0.

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
