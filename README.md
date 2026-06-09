<div align="center">
  <img width="520" src="images/formatkit-wordmark.png" alt="Miethe openHAB FormatKit">
</div>

# Miethe openHAB FormatKit

Miethe openHAB FormatKit is an independently maintained Visual Studio Code extension for formatting and cleaning up openHAB configuration files such as `.items` and `.sitemap` files.

This project is maintained by Manuel Miethe. It is **not affiliated with, endorsed by, or published by** the original `openHAB Alignment Tool` author or project. The codebase began as a maintained fork of the inactive open-source project by Maximilian Beckenbauer, and that origin is credited here for transparency. All marketplace branding, icon artwork, package identity, README wording, and command/settings namespace have been changed for this independent release.

[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/ManuelMiethe.miethe-openhab-formatkit?color=blue&label=Installs&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=ManuelMiethe.miethe-openhab-formatkit)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/ManuelMiethe.miethe-openhab-formatkit?color=orange&label=Version)](https://marketplace.visualstudio.com/items?itemName=ManuelMiethe.miethe-openhab-formatkit)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/stars/ManuelMiethe.miethe-openhab-formatkit?label=Rating&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=ManuelMiethe.miethe-openhab-formatkit)

## What changed for the independent release

- Extension display name changed to **Miethe openHAB FormatKit**.
- Marketplace package ID changed to `ManuelMiethe.miethe-openhab-formatkit`.
- Extension icon and README wordmark replaced with newly created artwork under `images/formatkit-*`.
- Commands and settings moved to the `miethe-openhab-formatkit.*` namespace.
- README and extension messaging rewritten to make the independent maintenance status clear.
- Attribution to the original open-source project is kept without implying affiliation or endorsement.

## Features

The extension uses the standard Visual Studio Code formatter API. You can format files with **Format Document**, **Format Selection**, or VS Code's format-on-save setting.

Supported formatting styles for openHAB item files:

- Column style
- Channel-column style
- Multiline style

Supported openHAB file types:

- `.items` — fully functional
- `.sitemap` — under development
- `.things` — under development / beta

### Item formatting examples

**Column style**

![Column style item formatting](images/items_column.png)

**Column-channel style**

![Column-channel item formatting](images/items_channelcolumn.png)

**Multiline style**

![Multiline item formatting](images/items_multiline.png)

**Sitemap formatting**

![Sitemap formatting](images/sitemap-formatting.gif)

## Maintained fixes

This maintained version includes fixes for openHAB item channel binding configurations where curly braces inside quoted strings could break formatting. Example affected cases are channel parameters that contain JSON-like values or text with `{...}` inside quotes.

It also corrects space-based column padding when `editor.insertSpaces` is enabled, so aligned columns stay consistent with the configured tab size.

## Extension settings

### New Line After Item

Insert a new line after each item unless a single empty line already exists.

```json
"miethe-openhab-formatkit.newLineAfterItem": true
```

### Preserve Whitespace

Preserve leading whitespace in front of items while reformatting.

```json
"miethe-openhab-formatkit.preserveWhitespace": true
```

### Minimum Indent Amount

Control the minimum separation of thing or item parts.

```json
"miethe-openhab-formatkit.minimumIndentAmount": 4
```

### Format Style

Choose the formatter style:

- `Column`
- `ChannelColumn`
- `Multiline`

```json
"miethe-openhab-formatkit.formatStyle": "Column"
```

### Enable Beta Features

Enable beta formatting support for sitemap or thing files.

```json
"miethe-openhab-formatkit.enableBetaFeatures": false
```

## Special comment tags

### New Group Tag

```text
// #OHNG#
```

Starts a new formatting group for an item section. Tracking of the longest item parts is reset for the new group.

![New formatting group](images/ng_formatting.png)

### New Formatting Style

```text
// #OHFS#%FORMATTING_STYLE%#OHFS#
```

Changes formatting for the following item definitions. Replace `%FORMATTING_STYLE%` with `Column`, `ChannelColumn`, or `Multiline`.

![New formatting style](images/fs_formatting.png)

## Attribution

This project originated as a maintained fork of the inactive open-source project `maxbec/openHAB-Alignment-Tool` by Maximilian Beckenbauer. The current extension is independently maintained by Manuel Miethe and uses distinct marketplace identity, branding, and documentation.

Original project: <https://github.com/maxbec/openHAB-Alignment-Tool>

## Support

If this maintained project helps you, you can support ongoing maintenance here:

- ☕ [Buy Manuel Miethe a coffee](https://www.buymeacoffee.com/mannemiethe)

## More information

- [openHAB Documentation](https://www.openhab.org/docs/)
- [openHAB Community](https://community.openhab.org)
- [Issues for this maintained project](https://github.com/mannemiethe/openHAB-Alignment-Tool/issues)

**Enjoy!**
