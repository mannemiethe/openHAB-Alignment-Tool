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

function createDiagnostic(lineIndex: number, line: string, text: string, message: string, severity = vscode.DiagnosticSeverity.Warning): vscode.Diagnostic {
	let start = Math.max(0, line.indexOf(text));
	let range = new vscode.Range(new vscode.Position(lineIndex, start), new vscode.Position(lineIndex, start + text.length));
	let diagnostic = new vscode.Diagnostic(range, message, severity);
	diagnostic.source = "openHAB FormatKit";
	return diagnostic;
}

function extractQuotedTags(line: string): string[] {
	let tagsMatch = line.match(/\[(.*?)\]/);
	if (!tagsMatch) {
		return [];
	}
	let tags: string[] = [];
	let tagRegex = /"([^"]+)"/g;
	let match: RegExpExecArray | null;
	while ((match = tagRegex.exec(tagsMatch[1])) !== null) {
		tags.push(match[1]);
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
			if (seen.has(tag)) {
				diagnostics.push(createDiagnostic(lineIndex, line, `"${tag}"`, `Duplicate semantic/tag entry "${tag}" on this Item.`, vscode.DiagnosticSeverity.Warning));
			}
			seen.add(tag);
		}

		let byKind: { [kind: string]: string[] } = { Location: [], Equipment: [], Point: [], Property: [] };
		for (let tag of tags) {
			let kind = getTagKind(tag);
			if (kind) {
				byKind[kind].push(tag);
			}
		}

		for (let kind of ["Location", "Equipment", "Point", "Property"]) {
			let values = byKind[kind];
			if (values.length > 1) {
				diagnostics.push(createDiagnostic(lineIndex, line, `"${values[1]}"`, `Only one semantic ${kind} tag should be used on one Item. Found: ${values.join(", ")}.`, vscode.DiagnosticSeverity.Warning));
			}
		}

		let primarySemanticKinds = ["Location", "Equipment", "Point"].filter((kind) => byKind[kind].length > 0);
		if (primarySemanticKinds.length > 1) {
			diagnostics.push(createDiagnostic(lineIndex, line, `"${byKind[primarySemanticKinds[1]][0]}"`, `Do not mix semantic ${primarySemanticKinds.join(" + ")} tags on one Item. Use one model role per Item.`, vscode.DiagnosticSeverity.Warning));
		}

		if (byKind.Property.length > 0 && byKind.Point.length === 0) {
			diagnostics.push(createDiagnostic(lineIndex, line, `"${byKind.Property[0]}"`, `Semantic Property tag "${byKind.Property[0]}" should be paired with a Point tag such as Measurement, Control, Status, Setpoint, Switch, Alarm, Forecast, or Calculation.`, vscode.DiagnosticSeverity.Warning));
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
