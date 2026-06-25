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

function getFileKind(document: vscode.TextDocument): "items" | "things" | "rules" | "script" | "sitemap" | "persist" | "transform" | "services" | "openhab" {
	let fileName = document.fileName.toLowerCase();
	let normalized = fileName.replace(/\\/g, "/");
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
	if (/\/transform\/.*\.(map|scale)$/i.test(normalized)) {
		return "transform";
	}
	if (/\/services\/.*\.cfg$/i.test(normalized)) {
		return "services";
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

const numberDimensions: CompletionSpec[] = [
	{ label: "Temperature", detail: "openHAB Number dimension", documentation: "Quantity Number for temperatures." },
	{ label: "Power", detail: "openHAB Number dimension", documentation: "Quantity Number for power values." },
	{ label: "Energy", detail: "openHAB Number dimension", documentation: "Quantity Number for energy values." },
	{ label: "Dimensionless", detail: "openHAB Number dimension", documentation: "Quantity Number for percentages and ratios." },
	{ label: "Length", detail: "openHAB Number dimension", documentation: "Quantity Number for length/distance values." },
	{ label: "Pressure", detail: "openHAB Number dimension", documentation: "Quantity Number for pressure values." },
	{ label: "ElectricPotential", detail: "openHAB Number dimension", documentation: "Quantity Number for voltage values." },
	{ label: "ElectricCurrent", detail: "openHAB Number dimension", documentation: "Quantity Number for current values." },
	{ label: "Frequency", detail: "openHAB Number dimension", documentation: "Quantity Number for frequency values." },
	{ label: "Speed", detail: "openHAB Number dimension", documentation: "Quantity Number for speed values." },
	{ label: "Time", detail: "openHAB Number dimension", documentation: "Quantity Number for duration/time values." },
	{ label: "DataAmount", detail: "openHAB Number dimension", documentation: "Quantity Number for data amount values." },
	{ label: "DataTransferRate", detail: "openHAB Number dimension", documentation: "Quantity Number for data transfer rate values." },
	{ label: "VolumetricFlowRate", detail: "openHAB Number dimension", documentation: "Quantity Number for flow rate values." },
];

const semanticLocations = ["Indoor", "Apartment", "Building", "Garage", "House", "Shed", "SummerHouse", "Corridor", "Floor", "Attic", "Basement", "FirstFloor", "GroundFloor", "SecondFloor", "ThirdFloor", "Room", "Bathroom", "Bedroom", "BoilerRoom", "Cellar", "DiningRoom", "Entry", "FamilyRoom", "GuestRoom", "Kitchen", "LaundryRoom", "LivingRoom", "Office", "Veranda", "Outdoor", "Carport", "Driveway", "Garden", "Patio", "Porch", "Terrace"];
const semanticEquipments = ["AlarmDevice", "AlarmSystem", "Application", "AudioVisual", "Display", "Projector", "Television", "MediaPlayer", "Receiver", "Screen", "Speaker", "Bed", "Camera", "CleaningRobot", "Computer", "ControlDevice", "Button", "Dial", "Keypad", "Slider", "WallSwitch", "Door", "BackDoor", "CellarDoor", "FrontDoor", "GarageDoor", "Gate", "InnerDoor", "SideDoor", "Doorbell", "DrinkingWater", "HotWaterFaucet", "WaterFilter", "WaterSoftener", "HVAC", "AirConditioner", "AirFilter", "Boiler", "Dehumidifier", "Fan", "CeilingFan", "ExhaustFan", "KitchenHood", "FloorHeating", "Furnace", "HeatPump", "HeatRecovery", "Humidifier", "RadiatorControl", "SmartVent", "Thermostat", "WaterHeater", "Horticulture", "Irrigation", "LawnMower", "SoilSensor", "LightSource", "AccentLight", "Chandelier", "Downlight", "FloodLight", "Lamp", "LightStrip", "LightStripe", "Lightbulb", "Pendant", "Sconce", "SpotLight", "TrackLight", "WallLight", "Lock", "NetworkAppliance", "Firewall", "NetworkSwitch", "Router", "WirelessAccessPoint", "PetCare", "Aquarium", "PetFeeder", "PetFlap", "PowerOutlet", "PowerSupply", "Battery", "EVSE", "Generator", "Inverter", "SolarPanel", "TransferSwitch", "UPS", "WindGenerator", "Printer", "Printer3D", "Pump", "WaterFeature", "RemoteControl", "Sensor", "AirQualitySensor", "CO2Sensor", "COSensor", "ContactSensor", "ElectricMeter", "FireDetector", "FlameDetector", "HeatDetector", "SmokeDetector", "GasMeter", "GlassBreakDetector", "HumiditySensor", "IlluminanceSensor", "LeakSensor", "OccupancySensor", "MotionDetector", "TemperatureSensor", "VibrationSensor", "WaterMeter", "WaterQualitySensor", "WeatherStation", "Siren", "Smartphone", "Tool", "Tracker", "Valve", "Vehicle", "Car", "VoiceAssistant", "WebService", "WeatherService", "Wellness", "Chlorinator", "Jacuzzi", "PoolCover", "PoolHeater", "Sauna", "Shower", "SwimmingPool", "WhiteGood", "AirFryer", "CoffeeMaker", "Cooktop", "Dishwasher", "Dryer", "FoodProcessor", "Freezer", "Fryer", "IceMaker", "Microwave", "Mixer", "Oven", "Range", "Refrigerator", "Toaster", "WashingMachine", "Window", "WindowCovering", "Blinds", "Drapes", "Zone", "AlarmZone"];
const semanticPoints = ["Alarm", "Calculation", "Control", "Switch", "Forecast", "Measurement", "Setpoint", "Status"];
const semanticProperties = ["AirQuality", "AQI", "CO", "CO2", "Ozone", "ParticulateMatter", "Pollen", "Radon", "VOC", "Airconditioning", "Airflow", "App", "Brightness", "Channel", "Color", "ColorTemperature", "Current", "Duration", "Enabled", "Energy", "Frequency", "Gas", "Heating", "Humidity", "Illuminance", "Info", "Level", "Light", "LowBattery", "MediaControl", "Mode", "Moisture", "Motion", "Noise", "Oil", "Opening", "LockState", "OpenLevel", "OpenState", "Position", "GeoLocation", "Power", "Precipitation", "Rain", "Presence", "Pressure", "Price", "Progress", "QualityOfService", "SignalStrength", "RSSI", "Smoke", "SoundVolume", "Speed", "StateOfCharge", "Tampered", "Temperature", "Tilt", "Timestamp", "Ultraviolet", "Ventilation", "Vibration", "Voltage", "Water", "Wind"];

function semanticTagCompletion(label: string, semanticKind: string): vscode.CompletionItem {
	return keyword({
		label,
		insertText: `"${label}"`,
		detail: `openHAB Semantic ${semanticKind} tag`,
		kind: vscode.CompletionItemKind.EnumMember,
	});
}

function getSemanticCompletions(): vscode.CompletionItem[] {
	return [
		...semanticLocations.map((label) => semanticTagCompletion(label, "Location")),
		...semanticEquipments.map((label) => semanticTagCompletion(label, "Equipment")),
		...semanticPoints.map((label) => semanticTagCompletion(label, "Point")),
		...semanticProperties.map((label) => semanticTagCompletion(label, "Property")),
		snippet("Semantic Location Group", "Group ${1:Location_Name} \"${2:Label}\" <${3:icon}> [\"${4|Indoor,Outdoor,Building,House,Garage,GroundFloor,FirstFloor,Room,Kitchen,LivingRoom,Bedroom,Bathroom,Office,Garden,Terrace|}\"]", "openHAB Semantic Model Location Group"),
		snippet("Semantic Equipment Group", "Group ${1:Equipment_Name} \"${2:Label}\" <${3:icon}> (${4:ParentLocation}) [\"${5|Equipment,LightSource,Lamp,Window,Door,Lock,HVAC,Thermostat,Sensor,TemperatureSensor,MotionDetector,Camera,PowerOutlet,WhiteGood,WashingMachine|}\"]", "openHAB Semantic Model Equipment Group"),
		snippet("Semantic Point Item", "${1|Switch,Dimmer,Number,Number:Temperature,Number:Dimensionless,String,Contact,DateTime,Color,Rollershutter|} ${2:Point_Name} \"${3:Label}\" <${4:icon}> (${5:EquipmentOrLocation}) [\"${6|Control,Switch,Measurement,Setpoint,Status,Alarm,Forecast,Calculation|}\", \"${7|Power,Light,Temperature,Humidity,Motion,Opening,OpenState,OpenLevel,LowBattery,Presence,Energy,Voltage,Current,SoundVolume|}\"] { channel=\"${8:binding:type:id:channel}\" }", "openHAB Semantic Model Point Item"),
		snippet("Light semantic model", "Group ${1:Room_Light} \"${2:Light}\" <light> (${3:Room}) [\"LightSource\"]\nSwitch ${1:Room_Light}_Power \"${2:Light}\" <switch> (${1:Room_Light}) [\"Switch\", \"Light\"] { channel=\"${4:binding:type:id:channel}\" }", "Common semantic model pattern for a light"),
		snippet("Temperature measurement point", "Number:Temperature ${1:Room_Temperature} \"${2:Temperature [%.1f %unit%]}\" <temperature> (${3:RoomOrEquipment}) [\"Measurement\", \"Temperature\"] { channel=\"${4:binding:type:id:channel}\" }", "Semantic temperature measurement Item"),
		snippet("Battery badge point", "Number:Dimensionless ${1:Equipment_Battery} \"${2:Battery [%d %%]}\" <batterylevel> (${3:Equipment}) [\"Measurement\", \"LowBattery\"] { channel=\"${4:binding:type:id:channel}\" }", "Semantic low-battery badge point"),
	];
}

const groupFunctions = ["EQUALITY", "AND", "OR", "NAND", "NOR", "SUM", "AVG", "MIN", "MAX", "COUNT", "LATEST", "EARLIEST"];
const thingChannelTypes = ["Call", "Color", "Contact", "DateTime", "Dimmer", "Image", "Location", "Number", "Player", "Rollershutter", "String", "Switch"];
const classicIcons = [
	"attic", "bath", "bedroom", "cellar", "corridor", "firstfloor", "garage", "garden", "groundfloor", "kitchen", "office", "terrace",
	"battery", "blinds", "camera", "door", "frontdoor", "garagedoor", "lawnmower", "lightbulb", "lock", "poweroutlet", "projector", "receiver", "screen", "siren", "wallswitch", "whitegood", "window",
	"colorpicker", "group", "rollershutter", "slider", "switch", "text", "humidity", "moon", "rain", "snow", "sun", "sun_clouds", "temperature", "wind",
	"batterylevel", "carbondioxide", "colorlight", "energy", "fire", "flow", "gas", "light", "lowbattery", "motion", "oil", "pressure", "price", "qualityofservice", "smoke", "soundvolume", "time", "water",
	"heating", "mediacontrol", "movecontrol", "zoom", "alarm", "party", "presence", "vacation", "calendar", "chart", "cinema", "climate", "contact", "dryer", "error", "fan", "faucet", "house", "microphone", "network", "none", "outdoorlight", "pantry", "player", "pump", "radiator", "recorder", "rgb", "settings", "shield", "solarplant", "status", "sunrise", "sunset", "video", "washingmachine"
];

function getIconCompletions(): vscode.CompletionItem[] {
	return classicIcons.map((label) => keyword({
		label,
		insertText: label,
		detail: "openHAB classic icon",
		kind: vscode.CompletionItemKind.Value,
	}));
}

function getTransformationUsageCompletions(): vscode.CompletionItem[] {
	return [
		snippet("MAP transform label", "[MAP(${1:file.map}):%s]", "openHAB label transformation"),
		snippet("SCALE transform label", "[SCALE(${1:file.scale}):%s]", "openHAB label transformation"),
		snippet("JS transform label", "[JS(${1:file.js}):%s]", "openHAB label transformation"),
		snippet("JSONPATH transform label", "[JSONPATH(${1:$.path}):%s]", "openHAB label transformation"),
		snippet("REGEX transform label", "[REGEX(${1:regex}):%s]", "openHAB label transformation"),
		snippet("transform action", "transform(\"${1|MAP,SCALE,JS,JSONPATH,REGEX,XPATH,EXEC|}\", \"${2:pattern-or-file}\", ${3:value})", "Rules DSL transformation action"),
		...[["MAP", "Map transformation"], ["SCALE", "Scale transformation"], ["JS", "Script transformation"], ["JSONPATH", "JSONPath transformation"], ["REGEX", "Regular expression transformation"], ["XPATH", "XPath transformation"], ["EXEC", "Exec transformation"]].map(([label, detail]) => keyword({ label, detail: `openHAB ${detail}` })),
	];
}


function isAtLineStartItemTypePosition(linePrefix: string): boolean {
	return /^\s*\S*$/.test(linePrefix);
}

function getNumberDimensionCompletions(): vscode.CompletionItem[] {
	return numberDimensions.map((dimension) => keyword({
		...dimension,
		kind: vscode.CompletionItemKind.EnumMember,
	}));
}

function getGroupFunctionCompletions(): vscode.CompletionItem[] {
	return groupFunctions.map((name) => snippet(name, `${name}(${"${1:.*}"})`, "openHAB Group aggregation function"));
}

function getGroupBaseTypeCompletions(): vscode.CompletionItem[] {
	return itemTypes
		.filter((itemType) => !itemType.label.includes(":"))
		.map((itemType) => keyword({
			label: itemType.label,
			detail: "openHAB Group base Item type",
			documentation: itemType.documentation,
			kind: vscode.CompletionItemKind.EnumMember,
		}));
}

function getContextualItemCompletions(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] | undefined {
	let linePrefix = document.lineAt(position.line).text.substring(0, position.character);
	if (/\bGroup:Number:[A-Z]*$/.test(linePrefix)) {
		return getGroupFunctionCompletions();
	}
	if (/\bGroup:[A-Za-z]*$/.test(linePrefix)) {
		return getGroupBaseTypeCompletions();
	}
	if (/\bNumber:[A-Za-z]*$/.test(linePrefix)) {
		return getNumberDimensionCompletions();
	}
	if (/\bGroup:Number:[A-Z]+\($/.test(linePrefix)) {
		return [keyword({ label: ".*", detail: "openHAB Group function wildcard regex", kind: vscode.CompletionItemKind.Value })];
	}
	if (!isAtLineStartItemTypePosition(linePrefix) && /\S/.test(linePrefix)) {
		return [];
	}
	return undefined;
}

function getItemCompletions(document?: vscode.TextDocument, position?: vscode.Position): vscode.CompletionItem[] {
	if (document && position) {
		let contextual = getContextualItemCompletions(document, position);
		if (contextual) {
			return contextual;
		}
	}
	let completions = itemTypes.map(keyword);
	completions.push(
		...getSemanticCompletions(),
		...getIconCompletions(),
		...getTransformationUsageCompletions(),
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
		snippet("playSound", "playSound(\"${1:sound.mp3}\")", "openHAB audio action"),
		snippet("playStream", "playStream(\"${1:https://example.com/stream.mp3}\")", "openHAB audio action"),
		snippet("say", "say(\"${1:Text to say}\")", "openHAB voice action"),
		snippet("interpret", "interpret(\"${1:turn on the light}\")", "openHAB voice interpreter action"),
		snippet("setMasterVolume", "setMasterVolume(${1:0.5})", "openHAB audio volume action"),
		snippet("getLocation", "getLocation(${1:ItemName})", "openHAB Semantics Action"),
		snippet("getEquipment", "getEquipment(${1:ItemName})", "openHAB Semantics Action"),
		snippet("getSemanticType", "getSemanticType(${1:ItemName})", "openHAB Semantics Action"),
		snippet("isLocation", "isLocation(${1:ItemName})", "openHAB Semantics Action"),
		snippet("isEquipment", "isEquipment(${1:ItemName})", "openHAB Semantics Action"),
		snippet("isPoint", "isPoint(${1:ItemName})", "openHAB Semantics Action"),
		...getTransformationUsageCompletions(),
		...[
			"rule", "when", "then", "end", "or", "import", "val", "var", "return",
			"System started", "System reached start level", "changed", "received command", "received update", "triggered",
			"logInfo", "logDebug", "logWarn", "logError", "sendCommand", "postUpdate", "createTimer", "playSound", "playStream", "say", "interpret", "setMasterVolume", "getMasterVolume",
			"isLocation", "isEquipment", "isPoint", "getLocation", "getLocationType", "getEquipment", "getEquipmentType", "getPointType", "getPropertyType", "getSemanticType",
		].map((label) => keyword({ label, detail: "openHAB Rules DSL keyword/action" })),
	];
}

function getSitemapCompletions(): vscode.CompletionItem[] {
	let elements = ["sitemap", "Frame", "Default", "Text", "Group", "Switch", "Buttongrid", "Button", "Selection", "Setpoint", "Slider", "Colorpicker", "Colortemperaturepicker", "Input", "Webview", "Mapview", "Image", "Video", "Chart"];
	let completions = elements.map((label) => keyword({ label, detail: "openHAB Sitemap element" }));
	completions.push(
		...getSemanticCompletions(),
		...getIconCompletions(),
		...getTransformationUsageCompletions(),
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

function getTransformFileCompletions(): vscode.CompletionItem[] {
	return [
		snippet("MAP entry", "${1:OPEN}=${2:Open}", "openHAB .map transformation entry"),
		snippet("MAP fallback", "${1:}=undefined", "Fallback .map transformation entry"),
		snippet("SCALE range", "[${1:0}..${2:10}]=${3:Low}", "openHAB .scale transformation range"),
		snippet("SCALE greater-than", "]${1:10}..${2:∞}]=${3:High}", "openHAB .scale upper range"),
		keyword({ label: "NULL", detail: "openHAB undefined state" }),
		keyword({ label: "UNDEF", detail: "openHAB undefined state" }),
		keyword({ label: "ON", detail: "openHAB common state" }),
		keyword({ label: "OFF", detail: "openHAB common state" }),
		keyword({ label: "OPEN", detail: "openHAB common state" }),
		keyword({ label: "CLOSED", detail: "openHAB common state" }),
	];
}

function getServicesCompletions(): vscode.CompletionItem[] {
	return [
		snippet("addons package", "package = ${1|minimal,standard,expert,legacy|}", "openHAB addons.cfg package setting"),
		snippet("addons binding", "binding = ${1:astro,knx,mqtt}", "openHAB addons.cfg binding list"),
		snippet("addons ui", "ui = ${1:basic,habpanel}", "openHAB addons.cfg UI list"),
		snippet("addons persistence", "persistence = ${1:rrd4j,mapdb,jdbc}", "openHAB addons.cfg persistence list"),
		snippet("addons transformation", "transformation = ${1:map,jsonpath,regex,scale,javascript,xpath}", "openHAB addons.cfg transformation list"),
		snippet("runtime default audio sink", "org.openhab.audio:defaultSink=${1:enhancedjavasound}", "openHAB runtime.cfg audio setting"),
		snippet("runtime default TTS", "org.openhab.voice:defaultTTS=${1:serviceId}", "openHAB runtime.cfg voice setting"),
		snippet("runtime default voice", "org.openhab.voice:defaultVoice=${1:voiceId}", "openHAB runtime.cfg voice setting"),
		snippet("runtime default STT", "org.openhab.voice:defaultSTT=${1:serviceId}", "openHAB runtime.cfg speech-to-text setting"),
		snippet("runtime default interpreter", "org.openhab.voice:defaultHLI=${1:system}", "openHAB runtime.cfg human-language interpreter setting"),
		...[
			"package", "binding", "ui", "persistence", "transformation", "voice", "automation", "misc", "remote",
			"minimal", "standard", "expert", "legacy", "map", "jsonpath", "regex", "scale", "javascript", "xpath", "rrd4j", "mapdb", "jdbc",
			"enhancedjavasound", "webaudio", "rulehli", "system", "opennlp",
		].map((label) => keyword({ label, detail: "openHAB service configuration keyword/value" })),
	];
}

function getGenericCompletions(): vscode.CompletionItem[] {
	return [
		...getItemCompletions(),
		...getThingsCompletions(),
		...getRuleCompletions(),
		...getSitemapCompletions(),
		...getPersistenceCompletions(),
		...getSemanticCompletions(),
		...getTransformFileCompletions(),
		...getServicesCompletions(),
	];
}

export function registerOpenhabCompletions(context: vscode.ExtensionContext, selector: vscode.DocumentSelector): void {
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.CompletionItem[]> {
			switch (getFileKind(document)) {
				case "items":
					return getItemCompletions(document, position);
				case "things":
					return getThingsCompletions();
				case "rules":
				case "script":
					return getRuleCompletions();
				case "sitemap":
					return getSitemapCompletions();
				case "persist":
					return getPersistenceCompletions();
				case "transform":
					return getTransformFileCompletions();
				case "services":
					return getServicesCompletions();
				default:
					return getGenericCompletions();
			}
		},
	}, ":", " ", "\"", "[", "{"));
}
