import * as vscode from "vscode";

type OutlineKind = "section" | "item" | "rule" | "import" | "variable" | "bridge" | "thing" | "channel" | "sitemap" | "persistence";

interface OutlineEntry {
	label: string;
	description?: string;
	kind: OutlineKind;
	range?: vscode.Range;
	children?: OutlineEntry[];
}

class FormatKitOutlineItem extends vscode.TreeItem {
	constructor(public readonly entry: OutlineEntry) {
		super(entry.label, entry.children && entry.children.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
		this.description = entry.description;
		this.contextValue = `openhab-formatkit-outline-${entry.kind}`;
		this.iconPath = getIcon(entry.kind);
		if (entry.range) {
			this.command = {
				command: "openhab-formatkit.outline.goto",
				title: "Go to Symbol",
				arguments: [entry.range],
			};
		}
	}
}

function getIcon(kind: OutlineKind): vscode.ThemeIcon {
	switch (kind) {
		case "section":
			return new vscode.ThemeIcon("list-tree");
		case "item":
			return new vscode.ThemeIcon("symbol-variable");
		case "rule":
			return new vscode.ThemeIcon("symbol-event");
		case "import":
			return new vscode.ThemeIcon("symbol-namespace");
		case "variable":
			return new vscode.ThemeIcon("symbol-constant");
		case "bridge":
			return new vscode.ThemeIcon("symbol-class");
		case "thing":
			return new vscode.ThemeIcon("symbol-object");
		case "channel":
			return new vscode.ThemeIcon("radio-tower");
		case "sitemap":
			return new vscode.ThemeIcon("layout");
		case "persistence":
			return new vscode.ThemeIcon("database");
		default:
			return new vscode.ThemeIcon("symbol-misc");
	}
}

function isSupportedDocument(document: vscode.TextDocument | undefined): boolean {
	if (!document) {
		return false;
	}
	return /\.(items|rules|things|sitemap|script|persist)$/i.test(document.fileName);
}

function stripBlockComments(text: string): string {
	return text.replace(/\/\*[\s\S]*?\*\//g, (match) => match.split("\n").map(() => "").join("\n"));
}

function stripLineComment(line: string): string {
	let inString = false;
	let escaped = false;
	for (let index = 0; index < line.length - 1; index++) {
		let current = line[index];
		if (escaped) {
			escaped = false;
			continue;
		}
		if (current === "\\") {
			escaped = true;
			continue;
		}
		if (current === '"') {
			inString = !inString;
			continue;
		}
		if (!inString && current === "/" && line[index + 1] === "/") {
			return line.substring(0, index);
		}
	}
	return line;
}

function makeRange(lineIndex: number, line: string, text: string): vscode.Range {
	let start = Math.max(0, line.indexOf(text));
	return new vscode.Range(new vscode.Position(lineIndex, start), new vscode.Position(lineIndex, start + text.length));
}

function section(label: string, kind: OutlineKind, children: OutlineEntry[]): OutlineEntry | undefined {
	if (children.length === 0) {
		return undefined;
	}
	return { label: `${label} (${children.length})`, kind: "section", children };
}

function parseItems(text: string): OutlineEntry[] {
	let cleanText = stripBlockComments(text);
	let lines = cleanText.split(/\r?\n/);
	let itemTypeRegex = /^\s*((?:Color|Contact|DateTime|Dimmer|Group|Image|Location|Number(?::(?!EQUALITY\b|AND\b|OR\b|NAND\b|NOR\b|SUM\b|AVG\b|MIN\b|MAX\b|COUNT\b|LATEST\b|EARLIEST\b)\w+)?|Player|Rollershutter|String|Switch)(?::(?:Color|Contact|DateTime|Dimmer|Group|Image|Location|Number(?::(?!EQUALITY\b|AND\b|OR\b|NAND\b|NOR\b|SUM\b|AVG\b|MIN\b|MAX\b|COUNT\b|LATEST\b|EARLIEST\b)\w+)?|Player|Rollershutter|String|Switch))?(?::(?:EQUALITY|AND|OR|NAND|NOR|SUM|AVG|MIN|MAX|COUNT|LATEST|EARLIEST)(?:\([^)]*\))?)?(?:\("[^"]*"\))?)\s+([A-Za-z0-9_äöüÄÖÜ]+)/;
	let items: OutlineEntry[] = [];
	lines.forEach((line, index) => {
		let code = stripLineComment(line);
		let match = code.match(itemTypeRegex);
		if (!match) {
			return;
		}
		items.push({
			label: match[2],
			description: match[1],
			kind: "item",
			range: makeRange(index, line, match[2]),
		});
	});
	return [section("Items", "section", items)].filter((entry): entry is OutlineEntry => !!entry);
}

function parseRules(text: string): OutlineEntry[] {
	let cleanText = stripBlockComments(text);
	let lines = cleanText.split(/\r?\n/);
	let imports: OutlineEntry[] = [];
	let variables: OutlineEntry[] = [];
	let rules: OutlineEntry[] = [];
	lines.forEach((line, index) => {
		let code = stripLineComment(line).trim();
		let importMatch = code.match(/^import\s+(.+)/);
		if (importMatch) {
			imports.push({ label: importMatch[1], kind: "import", range: makeRange(index, line, importMatch[1]) });
			return;
		}
		let variableMatch = code.match(/^(?:val|var)\s+([^=\s]+)/);
		if (variableMatch) {
			variables.push({ label: variableMatch[1], description: code.startsWith("val") ? "val" : "var", kind: "variable", range: makeRange(index, line, variableMatch[1]) });
			return;
		}
		let ruleMatch = code.match(/^rule\s+"([^"]+)"|^rule\s+(.+)/);
		if (ruleMatch) {
			let name = ruleMatch[1] || (ruleMatch[2] || "").trim();
			rules.push({ label: name, kind: "rule", range: makeRange(index, line, name) });
		}
	});
	return [section("Rules", "section", rules), section("Variables", "section", variables), section("Imports", "section", imports)].filter((entry): entry is OutlineEntry => !!entry);
}

function parseThings(text: string): OutlineEntry[] {
	let cleanText = stripBlockComments(text);
	let lines = cleanText.split(/\r?\n/);
	let roots: OutlineEntry[] = [];
	let stack: OutlineEntry[] = [];
	lines.forEach((line, index) => {
		let code = stripLineComment(line).trim();
		let bridgeOrThing = code.match(/^(Bridge|Thing)\s+([^\s]+)\s+([^\s{\[]+)?(?:\s+"([^"]+)")?/);
		if (bridgeOrThing) {
			let type = bridgeOrThing[1];
			let uid = bridgeOrThing[3] || bridgeOrThing[2];
			let label = bridgeOrThing[4] || "";
			let entry: OutlineEntry = {
				label: uid,
				description: label ? `${type}: ${label}` : type,
				kind: type === "Bridge" ? "bridge" : "thing",
				range: makeRange(index, line, uid),
				children: [],
			};
			let parent = stack.length > 0 ? stack[stack.length - 1] : undefined;
			if (parent && parent.children) {
				parent.children.push(entry);
			} else {
				roots.push(entry);
			}
			if (code.includes("{")) {
				stack.push(entry);
			}
			return;
		}
		let channel = code.match(/^(?:(Type|State|Trigger)\s+)?(\S+)\s*:\s*(\S+)(?:\s+"([^"]+)")?/);
		if (channel && !/^(Bridge|Thing|Channels)$/i.test(channel[2])) {
			let keyword = channel[1] || "State";
			let entry: OutlineEntry = {
				label: channel[3],
				description: channel[4] ? `${keyword} ${channel[2]}: ${channel[4]}` : `${keyword} ${channel[2]}`,
				kind: "channel",
				range: makeRange(index, line, channel[3]),
			};
			let parent = stack.length > 0 ? stack[stack.length - 1] : undefined;
			if (parent && parent.children) {
				parent.children.push(entry);
			} else {
				roots.push(entry);
			}
		}
		let closeCount = (code.match(/}/g) || []).length;
		for (let count = 0; count < closeCount; count++) {
			stack.pop();
		}
	});
	return [section("Things", "section", roots)].filter((entry): entry is OutlineEntry => !!entry);
}

function parseSitemap(text: string): OutlineEntry[] {
	let cleanText = stripBlockComments(text);
	let lines = cleanText.split(/\r?\n/);
	let entries: OutlineEntry[] = [];
	let sitemapRegex = /^\s*(sitemap|Frame|Default|Text|Group|Switch|Buttongrid|Button|Selection|Setpoint|Slider|Colorpicker|Colortemperaturepicker|Input|Webview|Mapview|Image|Video|Chart)\b(?:\s+([^\[{]+))?/i;
	lines.forEach((line, index) => {
		let code = stripLineComment(line).trim();
		let match = code.match(sitemapRegex);
		if (!match) {
			return;
		}
		let type = match[1];
		let labelMatch = code.match(/label\s*=\s*"([^"]+)"/);
		let itemMatch = code.match(/item\s*=\s*([A-Za-z0-9_]+)/);
		let label = labelMatch ? labelMatch[1] : itemMatch ? itemMatch[1] : (match[2] || type).trim();
		entries.push({ label, description: type, kind: "sitemap", range: makeRange(index, line, labelMatch ? labelMatch[1] : type) });
	});
	return [section("Sitemap", "section", entries)].filter((entry): entry is OutlineEntry => !!entry);
}

function parsePersistence(text: string): OutlineEntry[] {
	let cleanText = stripBlockComments(text);
	let lines = cleanText.split(/\r?\n/);
	let sections: { [name: string]: OutlineEntry[] } = {
		Strategies: [],
		Filters: [],
		Items: [],
		Aliases: [],
	};
	let currentSection = "";
	lines.forEach((line, index) => {
		let code = stripLineComment(line).trim();
		if (!code) {
			return;
		}
		let sectionMatch = code.match(/^(Strategies|Filters|Items|Aliases)\b/i);
		if (sectionMatch) {
			let canonical = sectionMatch[1].charAt(0).toUpperCase() + sectionMatch[1].slice(1).toLowerCase();
			currentSection = canonical;
			return;
		}
		if (code.includes("}")) {
			currentSection = "";
			return;
		}
		if (!currentSection || !sections[currentSection]) {
			return;
		}
		let entryMatch = code.match(/^([^:=>]+?)\s*(?::|=>|=|->)\s*(.+)$/);
		if (!entryMatch) {
			return;
		}
		let label = entryMatch[1].trim();
		let description = entryMatch[2].trim();
		sections[currentSection].push({
			label,
			description,
			kind: "persistence",
			range: makeRange(index, line, label),
		});
	});
	return [
		section("Strategies", "section", sections.Strategies),
		section("Filters", "section", sections.Filters),
		section("Items", "section", sections.Items),
		section("Aliases", "section", sections.Aliases),
	].filter((entry): entry is OutlineEntry => !!entry);
}

function parseDocument(document: vscode.TextDocument): OutlineEntry[] {
	let text = document.getText();
	if (/\.items$/i.test(document.fileName)) {
		return parseItems(text);
	}
	if (/\.rules$/i.test(document.fileName) || /\.script$/i.test(document.fileName)) {
		return parseRules(text);
	}
	if (/\.things$/i.test(document.fileName)) {
		return parseThings(text);
	}
	if (/\.sitemap$/i.test(document.fileName)) {
		return parseSitemap(text);
	}
	if (/\.persist$/i.test(document.fileName)) {
		return parsePersistence(text);
	}
	return [];
}

export class OpenhabFormatKitOutlineProvider implements vscode.TreeDataProvider<FormatKitOutlineItem> {
	private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<FormatKitOutlineItem | undefined | void>();
	public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
	private entries: OutlineEntry[] = [];

	constructor(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.window.onDidChangeActiveTextEditor(() => this.refresh()),
			vscode.workspace.onDidSaveTextDocument((document) => {
				if (isSupportedDocument(document)) {
					this.refresh(document);
				}
			}),
			vscode.workspace.onDidChangeTextDocument((event) => {
				let activeDocument = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : undefined;
				if (activeDocument && event.document === activeDocument && isSupportedDocument(event.document)) {
					this.refresh(event.document);
				}
			})
		);
		this.refresh();
	}

	public refresh(document?: vscode.TextDocument): void {
		let target = document || (vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : undefined);
		this.entries = isSupportedDocument(target) && target ? parseDocument(target) : [];
		this.onDidChangeTreeDataEmitter.fire();
	}

	public getTreeItem(element: FormatKitOutlineItem): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: FormatKitOutlineItem): Thenable<FormatKitOutlineItem[]> {
		let children = element ? (element.entry.children || []) : this.entries;
		return Promise.resolve(children.map((entry) => new FormatKitOutlineItem(entry)));
	}
}

export function revealOutlineRange(range: vscode.Range): void {
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
	editor.selection = new vscode.Selection(range.start, range.end);
}
