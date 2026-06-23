import * as vscode from "vscode";

interface CompletionSpec {
	label: string;
	insertText?: string;
	detail: string;
	documentation?: string;
	kind?: vscode.CompletionItemKind;
}

function snippet(label: string, insertText: string, detail: string, documentation?: string, kind = vscode.CompletionItemKind.Snippet): vscode.CompletionItem {
	let item = new vscode.CompletionItem(label, kind);
	item.insertText = new vscode.SnippetString(insertText);
	item.detail = detail;
	if (documentation) {
		item.documentation = new vscode.MarkdownString(documentation);
	}
	return item;
}

function keyword(spec: CompletionSpec): vscode.CompletionItem {
	let item = new vscode.CompletionItem(spec.label, spec.kind || vscode.CompletionItemKind.Keyword);
	item.insertText = spec.insertText ? new vscode.SnippetString(spec.insertText) : spec.label;
	item.detail = spec.detail;
	if (spec.documentation) {
		item.documentation = new vscode.MarkdownString(spec.documentation);
	}
	return item;
}

function getFileKind(document: vscode.TextDocument): "items" | "things" | "rules" | "script" | "sitemap" | "persist" | "openhab" {
	let fileName = document.fileName.toLowerCase();
	if (fileName.endsWith(".items")) {
		return "items";
	}
	if (fileName.endsWith(".things")) {
		return "things";
	}
	if (fileName.endsWith(".rules")) {
		return "rules";
	}
	if (fileName.endsWith(".script")) {
		return "script";
	}
	if (fileName.endsWith(".sitemap")) {
		return "sitemap";
	}
	if (fileName.endsWith(".persist")) {
		return "persist";
	}
	return "openhab";
}

const itemTypes: CompletionSpec[] = [
	{ label: "Call", detail: "openHAB Item type", documentation: "Identifies phone calls." },
	{ label: "Color", detail: "openHAB Item type", documentation: "Stores RGB/HSB color information." },
	{ label: "Contact", detail: "openHAB Item type", documentation: "Door/window style OPEN/CLOSED state." },
	{ label: "DateTime", detail: "openHAB Item type", documentation: "Stores date and time values." },
	{ label: "Dimmer", detail: "openHAB Item type", documentation: "Percentage dimmer value." },
	{ label: "Group", detail: "openHAB Item type", documentation: "Collects or nests Items." },
	{ label: "Image", detail: "openHAB Item type", documentation: "Holds binary image data." },
	{ label: "Location", detail: "openHAB Item type", documentation: "GPS coordinate / Point state." },
	{ label: "Number", detail: "openHAB Item type", documentation: "Plain numeric state." },
	{ label: "Number:Temperature", detail: "openHAB dimensioned Number", documentation: "Quantity Number with temperature unit support." },
	{ label: "Number:Power", detail: "openHAB dimensioned Number", documentation: "Quantity Number with power unit support." },
	{ label: "Number:Energy", detail: "openHAB dimensioned Number", documentation: "Quantity Number with energy unit support." },
	{ label: "Number:Length", detail: "openHAB dimensioned Number", documentation: "Quantity Number with length unit support." },
	{ label: "Number:Pressure", detail: "openHAB dimensioned Number", documentation: "Quantity Number with pressure unit support." },
	{ label: "Number:Dimensionless", detail: "openHAB dimensioned Number", documentation: "Quantity Number for percentages/ratios." },
	{ label: "Player", detail: "openHAB Item type", documentation: "Media player controls." },
	{ label: "Rollershutter", detail: "openHAB Item type", documentation: "Blinds/shutter commands and percent state." },
	{ label: "String", detail: "openHAB Item type", documentation: "Text state." },
	{ label: "Switch", detail: "openHAB Item type", documentation: "ON/OFF switch state." },
];

const groupFunctions = ["EQUALITY", "AND", "OR", "NAND", "NOR", "SUM", "AVG", "MIN", "MAX", "COUNT", "LATEST", "EARLIEST"];
const thingChannelTypes = ["Call", "Color", "Contact", "DateTime", "Dimmer", "Image", "Location", "Number", "Player", "Rollershutter", "String", "Switch"];

function getItemCompletions(): vscode.CompletionItem[] {
	let completions = itemTypes.map(keyword);
	completions.push(
		snippet("Item definition", "${1|Switch,Dimmer,Number,String,DateTime,Contact,Color,Rollershutter,Player,Location,Image,Call|} ${2:Item_Name} \"${3:Label}\" <${4:icon}> (${5:Group}) [\"${6:tag}\"] { channel=\"${7:binding:thing:channel}\" }", "openHAB Item definition"),
		snippet("Group:Number function", "Group:Number:${1|SUM,AVG,MIN,MAX,COUNT,LATEST,EARLIEST|}(${2:.*}) ${3:Group_Name} \"${4:Label}\"", "openHAB Group aggregation Item"),
		snippet("Channel link", "{ channel=\"${1:binding:type:id:channel}\" }", "openHAB Item channel link"),
		...groupFunctions.map((name) => keyword({ label: name, detail: "openHAB Group aggregation function" }))
	);
	return completions;
}

function getThingsCompletions(): vscode.CompletionItem[] {
	let completions: vscode.CompletionItem[] = [
		snippet("Bridge", "Bridge ${1:binding:type:id} \"${2:Label}\" [ ${3:parameter=\"value\"} ] {\n\t${0}\n}", "openHAB Bridge definition"),
		snippet("Thing", "Thing ${1:binding:type:id} \"${2:Label}\" [ ${3:parameter=\"value\"} ]", "openHAB Thing definition"),
		snippet("Contained Thing", "Thing ${1:typeId} ${2:thingId} \"${3:Label}\" [ ${4:parameter=\"value\"} ]", "Thing inside a Bridge block"),
		snippet("Channels block", "Channels:\n\t${0}", "openHAB Things channel section"),
		snippet("Type channel", "Type ${1:channelType} : ${2:channelId} \"${3:Label}\" [ ${4:parameter=\"value\"} ]", "Reference an existing channel type"),
		snippet("State channel", "State ${1|String,Switch,Number,Dimmer,Contact,Color,DateTime,Location,Rollershutter,Player,Image,Call|} : ${2:channelId} \"${3:Label}\" [ ${4:parameter=\"value\"} ]", "Explicit state channel"),
		snippet("Implicit state channel", "${1|String,Switch,Number,Dimmer,Contact,Color,DateTime,Location,Rollershutter,Player,Image,Call|} : ${2:channelId} \"${3:Label}\" [ ${4:parameter=\"value\"} ]", "Implicit State channel"),
		snippet("Trigger channel", "Trigger String : ${1:channelId} \"${2:Label}\" [ ${3:parameter=\"value\"} ]", "Trigger channel"),
		keyword({ label: "Bridge", detail: "openHAB Things keyword" }),
		keyword({ label: "Thing", detail: "openHAB Things keyword" }),
		keyword({ label: "Channels", detail: "openHAB Things keyword" }),
		keyword({ label: "Type", detail: "openHAB Channel keyword" }),
		keyword({ label: "State", detail: "openHAB Channel keyword" }),
		keyword({ label: "Trigger", detail: "openHAB Channel keyword" }),
	];
	completions.push(...thingChannelTypes.map((label) => keyword({ label, detail: "openHAB channel accepted Item type" })));
	return completions;
}

function getRuleCompletions(): vscode.CompletionItem[] {
	return [
		snippet("rule", "rule \"${1:Rule name}\"\nwhen\n\t${2|System started,Time cron \"0 0/5 * * * ?\",Item ItemName changed,Item ItemName received command,Member of GroupName changed|}\nthen\n\t${0}\nend", "openHAB Rules DSL rule"),
		snippet("Item changed trigger", "Item ${1:ItemName} changed${2:}", "Rules DSL Item changed trigger"),
		snippet("Item received command trigger", "Item ${1:ItemName} received command${2:}", "Rules DSL Item command trigger"),
		snippet("Item received update trigger", "Item ${1:ItemName} received update${2:}", "Rules DSL Item update trigger"),
		snippet("Member of changed trigger", "Member of ${1:GroupName} changed${2:}", "Rules DSL Group member trigger"),
		snippet("Time cron trigger", "Time cron \"${1:0 0/5 * * * ?}\"", "Rules DSL cron trigger"),
		snippet("Thing changed trigger", "Thing \"${1:binding:type:id}\" changed${2:}", "Rules DSL Thing status trigger"),
		snippet("Channel trigger", "Channel \"${1:binding:type:id:channel}\" triggered${2:}", "Rules DSL Channel trigger"),
		snippet("createTimer", "createTimer(now.plus${1|Seconds,Minutes,Hours|}(${2:1}), [ |\n\t${0}\n])", "Rules DSL timer action"),
		snippet("sendCommand", "${1:ItemName}.sendCommand(${2:ON})", "Send command to an Item"),
		snippet("postUpdate", "${1:ItemName}.postUpdate(${2:state})", "Post update to an Item"),
		...[
			"rule", "when", "then", "end", "or", "import", "val", "var", "return",
			"System started", "System reached start level", "changed", "received command", "received update", "triggered",
			"logInfo", "logDebug", "logWarn", "logError", "sendCommand", "postUpdate", "createTimer",
		].map((label) => keyword({ label, detail: "openHAB Rules DSL keyword/action" })),
	];
}

function getSitemapCompletions(): vscode.CompletionItem[] {
	let elements = ["sitemap", "Frame", "Default", "Text", "Group", "Switch", "Buttongrid", "Button", "Selection", "Setpoint", "Slider", "Colorpicker", "Colortemperaturepicker", "Input", "Webview", "Mapview", "Image", "Video", "Chart"];
	let completions = elements.map((label) => keyword({ label, detail: "openHAB Sitemap element" }));
	completions.push(
		snippet("sitemap", "sitemap ${1:name} label=\"${2:Label}\" {\n\t${0}\n}", "openHAB Sitemap root"),
		snippet("Frame", "Frame label=\"${1:Label}\" {\n\t${0}\n}", "Sitemap Frame"),
		snippet("Text", "Text item=${1:ItemName} label=\"${2:Label [%s]}\" icon=\"${3:icon}\"", "Sitemap Text element"),
		snippet("Switch", "Switch item=${1:ItemName} label=\"${2:Label}\" mappings=[${3:ON=\"On\", OFF=\"Off\"}]", "Sitemap Switch element"),
		snippet("Setpoint", "Setpoint item=${1:ItemName} label=\"${2:Label}\" minValue=${3:0} maxValue=${4:100} step=${5:1}", "Sitemap Setpoint element"),
		snippet("Slider", "Slider item=${1:ItemName} label=\"${2:Label}\"", "Sitemap Slider element"),
		snippet("Chart", "Chart item=${1:ItemName} period=${2|h,4h,8h,12h,D,3D,W,2W,M,2M,4M,Y|}", "Sitemap Chart element")
	);
	return completions;
}

function getPersistenceCompletions(): vscode.CompletionItem[] {
	return [
		snippet("Strategies", "Strategies {\n\t${1:everyMinute} : \"${2:0 * * * * ?}\"\n}\n", "Persistence Strategies section"),
		snippet("Filters", "Filters {\n\t${1:threshold} : ${2:> 5}\n}\n", "Persistence Filters section"),
		snippet("Items", "Items {\n\t${1:*} : strategy = ${2:everyChange, restoreOnStartup}\n}\n", "Persistence Items section"),
		snippet("Aliases", "Aliases {\n\t${1:ItemName} -> \"${2:alias}\"\n}\n", "Persistence Aliases section"),
		...[
			"Strategies", "Filters", "Items", "Aliases", "everyChange", "everyUpdate", "restoreOnStartup", "forecast", "strategy", "filter",
		].map((label) => keyword({ label, detail: "openHAB Persistence keyword" })),
	];
}

function getGenericCompletions(): vscode.CompletionItem[] {
	return [
		...getItemCompletions(),
		...getThingsCompletions(),
		...getRuleCompletions(),
		...getSitemapCompletions(),
		...getPersistenceCompletions(),
	];
}

export function registerOpenhabCompletions(context: vscode.ExtensionContext, selector: vscode.DocumentSelector): void {
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, {
		provideCompletionItems(document: vscode.TextDocument): vscode.ProviderResult<vscode.CompletionItem[]> {
			switch (getFileKind(document)) {
				case "items":
					return getItemCompletions();
				case "things":
					return getThingsCompletions();
				case "rules":
				case "script":
					return getRuleCompletions();
				case "sitemap":
					return getSitemapCompletions();
				case "persist":
					return getPersistenceCompletions();
				default:
					return getGenericCompletions();
			}
		},
	}, ":", " ", "\"", "[", "{"));
}
