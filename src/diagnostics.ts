import * as vscode from "vscode";

const semanticLocations = new Set(["Indoor", "Apartment", "Building", "Garage", "House", "Shed", "SummerHouse", "Corridor", "Floor", "Attic", "Basement", "FirstFloor", "GroundFloor", "SecondFloor", "ThirdFloor", "Room", "Bathroom", "Bedroom", "BoilerRoom", "Cellar", "DiningRoom", "Entry", "FamilyRoom", "GuestRoom", "Kitchen", "LaundryRoom", "LivingRoom", "Office", "Veranda", "Outdoor", "Carport", "Driveway", "Garden", "Patio", "Porch", "Terrace"]);
const semanticEquipments = new Set(["AlarmDevice", "AlarmSystem", "Application", "AudioVisual", "Display", "Projector", "Television", "MediaPlayer", "Receiver", "Screen", "Speaker", "Bed", "Camera", "CleaningRobot", "Computer", "ControlDevice", "Button", "Dial", "Keypad", "Slider", "WallSwitch", "Door", "BackDoor", "CellarDoor", "FrontDoor", "GarageDoor", "Gate", "InnerDoor", "SideDoor", "Doorbell", "DrinkingWater", "HotWaterFaucet", "WaterFilter", "WaterSoftener", "HVAC", "AirConditioner", "AirFilter", "Boiler", "Dehumidifier", "Fan", "CeilingFan", "ExhaustFan", "KitchenHood", "FloorHeating", "Furnace", "HeatPump", "HeatRecovery", "Humidifier", "RadiatorControl", "SmartVent", "Thermostat", "WaterHeater", "Horticulture", "Irrigation", "LawnMower", "SoilSensor", "LightSource", "AccentLight", "Chandelier", "Downlight", "FloodLight", "Lamp", "LightStrip", "LightStripe", "Lightbulb", "Pendant", "Sconce", "SpotLight", "TrackLight", "WallLight", "Lock", "NetworkAppliance", "Firewall", "NetworkSwitch", "Router", "WirelessAccessPoint", "PetCare", "Aquarium", "PetFeeder", "PetFlap", "PowerOutlet", "PowerSupply", "Battery", "EVSE", "Generator", "Inverter", "SolarPanel", "TransferSwitch", "UPS", "WindGenerator", "Printer", "Printer3D", "Pump", "WaterFeature", "RemoteControl", "Sensor", "AirQualitySensor", "CO2Sensor", "COSensor", "ContactSensor", "ElectricMeter", "FireDetector", "FlameDetector", "HeatDetector", "SmokeDetector", "GasMeter", "GlassBreakDetector", "HumiditySensor", "IlluminanceSensor", "LeakSensor", "OccupancySensor", "MotionDetector", "TemperatureSensor", "VibrationSensor", "WaterMeter", "WaterQualitySensor", "WeatherStation", "Siren", "Smartphone", "Tool", "Tracker", "Valve", "Vehicle", "Car", "VoiceAssistant", "WebService", "WeatherService", "Wellness", "Chlorinator", "Jacuzzi", "PoolCover", "PoolHeater", "Sauna", "Shower", "SwimmingPool", "WhiteGood", "AirFryer", "CoffeeMaker", "Cooktop", "Dishwasher", "Dryer", "FoodProcessor", "Freezer", "Fryer", "IceMaker", "Microwave", "Mixer", "Oven", "Range", "Refrigerator", "Toaster", "WashingMachine", "Window", "WindowCovering", "Blinds", "Drapes", "Zone", "AlarmZone"]);
const semanticPoints = new Set(["Alarm", "Calculation", "Control", "Switch", "Forecast", "Measurement", "Setpoint", "Status"]);
const semanticProperties = new Set(["AirQuality", "AQI", "CO", "CO2", "Ozone", "ParticulateMatter", "Pollen", "Radon", "VOC", "Airconditioning", "Airflow", "App", "Brightness", "Channel", "Color", "ColorTemperature", "Current", "Duration", "Enabled", "Energy", "Frequency", "Gas", "Heating", "Humidity", "Illuminance", "Info", "Level", "Light", "LowBattery", "MediaControl", "Mode", "Moisture", "Motion", "Noise", "Oil", "Opening", "LockState", "OpenLevel", "OpenState", "Position", "GeoLocation", "Power", "Precipitation", "Rain", "Presence", "Pressure", "Price", "Progress", "QualityOfService", "SignalStrength", "RSSI", "Smoke", "SoundVolume", "Speed", "StateOfCharge", "Tampered", "Temperature", "Tilt", "Timestamp", "Ultraviolet", "Ventilation", "Vibration", "Voltage", "Water", "Wind"]);

function isItemsDocument(document: vscode.TextDocument): boolean {
	return document.fileName.toLowerCase().endsWith(".items");
}

function getTagKind(tag: string): "Location" | "Equipment" | "Point" | "Property" | undefined {
	if (semanticLocations.has(tag)) {
		return "Location";
	}
	if (semanticEquipments.has(tag)) {
		return "Equipment";
	}
	if (semanticPoints.has(tag)) {
		return "Point";
	}
	if (semanticProperties.has(tag)) {
		return "Property";
	}
	return undefined;
}

interface ParsedTag {
	value: string;
	start: number;
	end: number;
}

function createDiagnosticAt(lineIndex: number, start: number, end: number, message: string, severity = vscode.DiagnosticSeverity.Warning): vscode.Diagnostic {
	let range = new vscode.Range(new vscode.Position(lineIndex, start), new vscode.Position(lineIndex, end));
	let diagnostic = new vscode.Diagnostic(range, message, severity);
	diagnostic.source = "openHAB FormatKit";
	return diagnostic;
}

function stripInlineComment(line: string): string {
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

function extractQuotedTags(line: string): ParsedTag[] {
	let code = stripInlineComment(line);
	let channelStart = code.indexOf("{");
	if (channelStart >= 0) {
		code = code.substring(0, channelStart);
	}

	let tags: ParsedTag[] = [];
	let bracketRegex = /\[([^\]]*)\]/g;
	let bracketMatch: RegExpExecArray | null;
	while ((bracketMatch = bracketRegex.exec(code)) !== null) {
		let bracketContent = bracketMatch[1];
		let tagRegex = /"([^"]+)"/g;
		let tagMatch: RegExpExecArray | null;
		while ((tagMatch = tagRegex.exec(bracketContent)) !== null) {
			let value = tagMatch[1];
			let start = bracketMatch.index + 1 + tagMatch.index;
			tags.push({ value, start, end: start + value.length + 2 });
		}
	}
	return tags;
}

function validateItemsDocument(document: vscode.TextDocument): vscode.Diagnostic[] {
	let diagnostics: vscode.Diagnostic[] = [];
	for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
		let line = document.lineAt(lineIndex).text;
		let trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
			continue;
		}
		let tags = extractQuotedTags(line);
		if (tags.length === 0) {
			continue;
		}

		let seen = new Set<string>();
		for (let tag of tags) {
			if (seen.has(tag.value)) {
				diagnostics.push(createDiagnosticAt(lineIndex, tag.start, tag.end, `Duplicate semantic/tag entry "${tag.value}" on this Item.`, vscode.DiagnosticSeverity.Warning));
			}
			seen.add(tag.value);
		}

		let byKind: { [kind: string]: ParsedTag[] } = { Location: [], Equipment: [], Point: [], Property: [] };
		for (let tag of tags) {
			let kind = getTagKind(tag.value);
			if (kind) {
				byKind[kind].push(tag);
			}
		}

		for (let kind of ["Location", "Equipment", "Point", "Property"]) {
			let values = byKind[kind];
			if (values.length > 1) {
				diagnostics.push(createDiagnosticAt(lineIndex, values[1].start, values[1].end, `Only one semantic ${kind} tag should be used on one Item. Found: ${values.map((tag) => tag.value).join(", ")}.`, vscode.DiagnosticSeverity.Warning));
			}
		}

		let primarySemanticKinds = ["Location", "Equipment", "Point"].filter((kind) => byKind[kind].length > 0);
		if (primarySemanticKinds.length > 1) {
			let tag = byKind[primarySemanticKinds[1]][0];
			diagnostics.push(createDiagnosticAt(lineIndex, tag.start, tag.end, `Do not mix semantic ${primarySemanticKinds.join(" + ")} tags on one Item. Use one model role per Item.`, vscode.DiagnosticSeverity.Warning));
		}

		if (byKind.Property.length > 0 && byKind.Point.length === 0) {
			let tag = byKind.Property[0];
			diagnostics.push(createDiagnosticAt(lineIndex, tag.start, tag.end, `Semantic Property tag "${tag.value}" should be paired with a Point tag such as Measurement, Control, Status, Setpoint, Switch, Alarm, Forecast, or Calculation.`, vscode.DiagnosticSeverity.Warning));
		}
	}
	return diagnostics;
}

export function registerOpenhabDiagnostics(context: vscode.ExtensionContext): void {
	let collection = vscode.languages.createDiagnosticCollection("openHAB FormatKit");
	context.subscriptions.push(collection);

	let refresh = (document: vscode.TextDocument | undefined) => {
		if (!document || !isItemsDocument(document)) {
			return;
		}
		collection.set(document.uri, validateItemsDocument(document));
	};

	if (vscode.window.activeTextEditor) {
		refresh(vscode.window.activeTextEditor.document);
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => refresh(editor ? editor.document : undefined)),
		vscode.workspace.onDidOpenTextDocument((document) => refresh(document)),
		vscode.workspace.onDidSaveTextDocument((document) => refresh(document)),
		vscode.workspace.onDidChangeTextDocument((event) => refresh(event.document)),
		vscode.workspace.onDidCloseTextDocument((document) => collection.delete(document.uri))
	);
}
