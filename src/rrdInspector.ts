import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

const STRING_BYTES = 40;
const INT_BYTES = 4;
const LONG_BYTES = 8;
const DOUBLE_BYTES = 8;

interface RrdDatasource {
	index: number;
	name: string;
	type: string;
	heartbeat: number;
	min: number;
	max: number;
	lastValue: number;
	nanSeconds: number;
	accumValue: number;
}

interface RrdArchive {
	index: number;
	consolFun: string;
	xff: number;
	steps: number;
	rows: number;
	arcStep: number;
	startTime: number;
	endTime: number;
	pointers: number[];
	states: { accumValue: number; nanSteps: number }[];
	valueBaseOffset: number;
	layout: "array" | "matrix";
}

interface RrdRow {
	row: number;
	arrayIndex: number;
	timestamp: number;
	date: string;
	value: number | null;
}

interface RrdModel {
	file: string;
	itemName: string;
	signature: string;
	version: number;
	step: number;
	lastUpdateTime: number;
	datasources: RrdDatasource[];
	archives: RrdArchive[];
}

interface PendingEdit {
	datasourceIndex: number;
	archiveIndex: number;
	row: number;
	value: number | null;
}

class RrdBufferReader {
	private offset = 0;
	constructor(private readonly buffer: Buffer) {}

	position(): number {
		return this.offset;
	}

	readString(): string {
		let value = readRrdString(this.buffer, this.offset, 20);
		this.offset += STRING_BYTES;
		return value;
	}

	readInt(): number {
		let value = this.buffer.readInt32BE(this.offset);
		this.offset += INT_BYTES;
		return value;
	}

	readLong(): number {
		let value = Number(this.buffer.readBigInt64BE(this.offset));
		this.offset += LONG_BYTES;
		return value;
	}

	readDouble(): number {
		let value = this.buffer.readDoubleBE(this.offset);
		this.offset += DOUBLE_BYTES;
		return value;
	}

	skip(bytes: number): number {
		let oldOffset = this.offset;
		this.offset += bytes;
		return oldOffset;
	}
}

function readRrdString(buffer: Buffer, offset: number, length: number): string {
	let chars: number[] = [];
	for (let index = 0; index < length; index++) {
		chars.push(buffer.readUInt16BE(offset + index * 2));
	}

	let realStringOffset = 0;
	let privateAreaSize = 0xf8ff - 0xe000 + 1;
	let limit = length;
	for (let index = 0; index < length; index++) {
		let char = chars[length - index - 1];
		if (char >= 0xe000 && char <= 0xf8ff) {
			realStringOffset += (char - 0xe000) * Math.pow(privateAreaSize, index);
			limit = length - index - 1;
		} else {
			break;
		}
	}

	if (realStringOffset > 0) {
		let size = buffer.readInt16BE(realStringOffset);
		if (size < 0) {
			size += 65536;
		}
		return readUtf16Be(buffer, realStringOffset - size * 2, size);
	}
	return String.fromCharCode(...chars.slice(0, limit)).trim();
}

function readUtf16Be(buffer: Buffer, offset: number, length: number): string {
	let chars: number[] = [];
	for (let index = 0; index < length; index++) {
		chars.push(buffer.readUInt16BE(offset + index * 2));
	}
	return String.fromCharCode(...chars).trim();
}

export function parseRrd(buffer: Buffer, filePath: string): RrdModel {
	let reader = new RrdBufferReader(buffer);
	let signature = reader.readString();
	if (!signature.startsWith("RRD4J") && !signature.startsWith("JR")) {
		throw new Error("Not an RRD4J RRD file");
	}
	let version = signature.endsWith("version 0.2") ? 2 : 1;
	let step = reader.readLong();
	let dsCount = reader.readInt();
	let arcCount = reader.readInt();
	let lastUpdateTime = reader.readLong();

	let datasources: RrdDatasource[] = [];
	for (let index = 0; index < dsCount; index++) {
		datasources.push({
			index,
			name: reader.readString(),
			type: reader.readString(),
			heartbeat: reader.readLong(),
			min: reader.readDouble(),
			max: reader.readDouble(),
			lastValue: reader.readDouble(),
			nanSeconds: reader.readLong(),
			accumValue: reader.readDouble(),
		});
	}

	let archives: RrdArchive[] = [];
	for (let index = 0; index < arcCount; index++) {
		let consolFun = reader.readString();
		let xff = reader.readDouble();
		let steps = reader.readInt();
		let rows = reader.readInt();
		let pointers: number[] = [];
		let states: { accumValue: number; nanSteps: number }[] = [];
		let valueBaseOffset: number;
		let layout: "array" | "matrix" = version === 1 ? "array" : "matrix";

		if (version === 1) {
			valueBaseOffset = -1;
			for (let dsIndex = 0; dsIndex < dsCount; dsIndex++) {
				states.push({ accumValue: reader.readDouble(), nanSteps: reader.readLong() });
				pointers.push(reader.readInt());
				let robinOffset = reader.skip(rows * DOUBLE_BYTES);
				if (dsIndex === 0) {
					valueBaseOffset = robinOffset;
				}
			}
		} else {
			for (let dsIndex = 0; dsIndex < dsCount; dsIndex++) {
				pointers.push(reader.readInt());
			}
			for (let dsIndex = 0; dsIndex < dsCount; dsIndex++) {
				states.push({ accumValue: reader.readDouble(), nanSteps: reader.readLong() });
			}
			valueBaseOffset = reader.skip(rows * dsCount * DOUBLE_BYTES);
		}

		let arcStep = step * steps;
		let endTime = normalize(lastUpdateTime, arcStep);
		let startTime = endTime - (rows - 1) * arcStep;
		archives.push({ index, consolFun, xff, steps, rows, arcStep, startTime, endTime, pointers, states, valueBaseOffset, layout });
	}

	return {
		file: filePath,
		itemName: path.basename(filePath, ".rrd"),
		signature,
		version,
		step,
		lastUpdateTime,
		datasources,
		archives,
	};
}

function normalize(timestamp: number, step: number): number {
	return timestamp - timestamp % step;
}

function valueOffset(model: RrdModel, archive: RrdArchive, datasourceIndex: number, row: number): { offset: number; arrayIndex: number } {
	let pointer = archive.pointers[datasourceIndex] || 0;
	let arrayIndex = (pointer + row) % archive.rows;
	if (archive.layout === "matrix") {
		return {
			arrayIndex,
			offset: archive.valueBaseOffset + (archive.pointers.length * arrayIndex + datasourceIndex) * DOUBLE_BYTES,
		};
	}
	let archiveStart = getArchiveStartOffset(model, archive.index);
	let dsBlockSize = 16 + INT_BYTES + archive.rows * DOUBLE_BYTES;
	let dsRobinBase = archiveStart + STRING_BYTES + DOUBLE_BYTES + INT_BYTES + INT_BYTES + datasourceIndex * dsBlockSize + 16 + INT_BYTES;
	return { arrayIndex, offset: dsRobinBase + arrayIndex * DOUBLE_BYTES };
}

function getArchiveStartOffset(model: RrdModel, archiveIndex: number): number {
	let offset = 64 + model.datasources.length * 128;
	for (let index = 0; index < archiveIndex; index++) {
		let archive = model.archives[index];
		offset += STRING_BYTES + DOUBLE_BYTES + INT_BYTES + INT_BYTES;
		if (archive.layout === "matrix") {
			offset += model.datasources.length * INT_BYTES;
			offset += model.datasources.length * 16;
			offset += archive.rows * model.datasources.length * DOUBLE_BYTES;
		} else {
			offset += model.datasources.length * (16 + INT_BYTES + archive.rows * DOUBLE_BYTES);
		}
	}
	return offset;
}

export function getRows(buffer: Buffer, model: RrdModel, datasourceIndex: number, archiveIndex: number): RrdRow[] {
	let archive = model.archives[archiveIndex];
	let rows: RrdRow[] = [];
	for (let row = 0; row < archive.rows; row++) {
		let location = valueOffset(model, archive, datasourceIndex, row);
		let rawValue = buffer.readDoubleBE(location.offset);
		let timestamp = archive.startTime + row * archive.arcStep;
		rows.push({
			row,
			arrayIndex: location.arrayIndex,
			timestamp,
			date: new Date(timestamp * 1000).toLocaleString(),
			value: Number.isNaN(rawValue) ? null : rawValue,
		});
	}
	return rows;
}

function writeEdits(filePath: string, model: RrdModel, edits: PendingEdit[], expectedMtimeMs: number): string {
	if (edits.length === 0) {
		throw new Error("No changed values to save.");
	}
	let currentStat = fs.statSync(filePath);
	if (Math.abs(currentStat.mtimeMs - expectedMtimeMs) > 1) {
		throw new Error("RRD file changed on disk after it was loaded. Refresh before saving to avoid overwriting openHAB updates.");
	}
	let buffer = fs.readFileSync(filePath);
	let backupPath = `${filePath}.formatkit-backup-${new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 17)}`;
	fs.copyFileSync(filePath, backupPath);
	for (let edit of edits) {
		validateEdit(model, edit);
		let archive = model.archives[edit.archiveIndex];
		let location = valueOffset(model, archive, edit.datasourceIndex, edit.row);
		buffer.writeDoubleBE(edit.value === null ? Number.NaN : edit.value, location.offset);
	}
	fs.writeFileSync(filePath, buffer);
	return backupPath;
}

function validateEdit(model: RrdModel, edit: PendingEdit): void {
	if (!Number.isInteger(edit.datasourceIndex) || edit.datasourceIndex < 0 || edit.datasourceIndex >= model.datasources.length) {
		throw new Error(`Invalid datasource index: ${edit.datasourceIndex}`);
	}
	if (!Number.isInteger(edit.archiveIndex) || edit.archiveIndex < 0 || edit.archiveIndex >= model.archives.length) {
		throw new Error(`Invalid archive index: ${edit.archiveIndex}`);
	}
	let archive = model.archives[edit.archiveIndex];
	if (!Number.isInteger(edit.row) || edit.row < 0 || edit.row >= archive.rows) {
		throw new Error(`Invalid archive row: ${edit.row}`);
	}
	if (edit.value !== null && !Number.isFinite(edit.value)) {
		throw new Error(`Invalid numeric value for row ${edit.row}`);
	}
}

class RrdInspectorDocument implements vscode.CustomDocument {
	constructor(public readonly uri: vscode.Uri) {}
	dispose(): void {}
}

export class RrdInspectorEditorProvider implements vscode.CustomReadonlyEditorProvider<RrdInspectorDocument> {
	constructor(private readonly context: vscode.ExtensionContext) {}

	openCustomDocument(uri: vscode.Uri): RrdInspectorDocument {
		return new RrdInspectorDocument(uri);
	}

	async resolveCustomEditor(document: RrdInspectorDocument, webviewPanel: vscode.WebviewPanel): Promise<void> {
		webviewPanel.webview.options = { enableScripts: true };
		let render = () => {
			try {
				let buffer = fs.readFileSync(document.uri.fsPath);
				let stat = fs.statSync(document.uri.fsPath);
				let model = parseRrd(buffer, document.uri.fsPath);
				webviewPanel.webview.html = getHtml(webviewPanel.webview, model, getRows(buffer, model, 0, 0), "", 0, 0, stat.mtimeMs);
			} catch (error) {
				webviewPanel.webview.html = getErrorHtml(error);
			}
		};
		render();
		webviewPanel.webview.onDidReceiveMessage((message) => {
			try {
				let buffer = fs.readFileSync(document.uri.fsPath);
				let stat = fs.statSync(document.uri.fsPath);
				let model = parseRrd(buffer, document.uri.fsPath);
				let datasourceIndex = normalizeIndex(message.datasourceIndex, model.datasources.length);
				let archiveIndex = normalizeIndex(message.archiveIndex, model.archives.length);
				if (message.type === "select") {
					webviewPanel.webview.html = getHtml(webviewPanel.webview, model, getRows(buffer, model, datasourceIndex, archiveIndex), "", datasourceIndex, archiveIndex, stat.mtimeMs);
				} else if (message.type === "save") {
					let backupPath = writeEdits(document.uri.fsPath, model, message.edits || [], Number(message.expectedMtimeMs));
					let freshBuffer = fs.readFileSync(document.uri.fsPath);
					let freshStat = fs.statSync(document.uri.fsPath);
					let freshModel = parseRrd(freshBuffer, document.uri.fsPath);
					webviewPanel.webview.html = getHtml(webviewPanel.webview, freshModel, getRows(freshBuffer, freshModel, datasourceIndex, archiveIndex), `Saved. Backup: ${backupPath}`, datasourceIndex, archiveIndex, freshStat.mtimeMs);
				} else if (message.type === "refresh") {
					render();
				}
			} catch (error) {
				webviewPanel.webview.html = getErrorHtml(error);
			}
		});
	}
}

function normalizeIndex(value: unknown, length: number): number {
	let index = Number(value);
	if (!Number.isInteger(index) || index < 0 || index >= length) {
		return 0;
	}
	return index;
}

function getNonce(): string {
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let nonce = "";
	for (let index = 0; index < 32; index++) {
		nonce += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return nonce;
}

function getHtml(webview: vscode.Webview, model: RrdModel, rows: RrdRow[], notice: string, selectedDatasourceIndex: number, selectedArchiveIndex: number, fileMtimeMs: number): string {
	let nonce = getNonce();
	if (model.datasources.length === 0 || model.archives.length === 0) {
		return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}';"><style nonce="${nonce}">body{font-family:var(--vscode-font-family);padding:14px;color:var(--vscode-foreground);background:var(--vscode-editor-background)}</style></head><body><h2>openHAB RRD Inspector</h2><p>${escapeHtml(model.itemName)} has no datasource/archive data to display.</p></body></html>`;
	}
	let selectedArchive = model.archives[selectedArchiveIndex];
	let datasourceOptions = model.datasources.map((ds) => `<option value="${ds.index}"${ds.index === selectedDatasourceIndex ? " selected" : ""}>${escapeHtml(ds.name)} (${escapeHtml(ds.type)})</option>`).join("");
	let archiveOptions = model.archives.map((arc) => `<option value="${arc.index}"${arc.index === selectedArchiveIndex ? " selected" : ""}>${arc.index}: ${escapeHtml(arc.consolFun)} / step ${arc.arcStep}s / rows ${arc.rows}</option>`).join("");
	let tableRows = rows.map((row) => `<tr data-row="${row.row}"><td>${row.row}</td><td>${row.arrayIndex}</td><td>${row.timestamp}</td><td>${escapeHtml(row.date)}</td><td><input data-row="${row.row}" value="${row.value === null ? "NaN" : row.value}" /></td></tr>`).join("");
	return `<!doctype html>
<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';"><style nonce="${nonce}">
body{font-family:var(--vscode-font-family);padding:14px;color:var(--vscode-foreground);background:var(--vscode-editor-background)}
.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.notice{color:var(--vscode-testing-iconPassed);margin:8px 0}.meta{opacity:.85;margin-bottom:10px}button,select,input{font:inherit}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid var(--vscode-panel-border);padding:4px 6px;text-align:left}th{position:sticky;top:0;background:var(--vscode-editorWidget-background)}input{width:100%;box-sizing:border-box;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border)}.nan input{color:var(--vscode-editorWarning-foreground)}
</style></head><body>
<h2>openHAB RRD Inspector</h2>
<div class="meta"><b>${escapeHtml(model.itemName)}</b> · ${escapeHtml(model.signature)} · step ${model.step}s · last update ${new Date(model.lastUpdateTime * 1000).toLocaleString()}</div>
${notice ? `<div class="notice">${escapeHtml(notice)}</div>` : ""}
<div class="toolbar"><label>Datasource <select id="ds">${datasourceOptions}</select></label><label>Archive <select id="arc">${archiveOptions}</select></label><button id="load">Load</button><button id="save">Save changed values</button><button id="refresh">Refresh</button><span id="dirty"></span></div>
<div class="toolbar"><label>Add/update timestamp <input id="addTs" placeholder="Unix seconds" /></label><label>Value <input id="addValue" placeholder="number or NaN" /></label><button id="addByTimestamp">Map to archive row</button><span>Archive range: ${selectedArchive.startTime}–${selectedArchive.endTime}, step ${selectedArchive.arcStep}s</span></div>
<table><thead><tr><th>Row</th><th>Raw index</th><th>Timestamp</th><th>Date</th><th>Value</th></tr></thead><tbody>${tableRows}</tbody></table>
<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const archiveStart = ${selectedArchive.startTime};
const archiveEnd = ${selectedArchive.endTime};
const archiveStep = ${selectedArchive.arcStep};
const archiveRows = ${selectedArchive.rows};
const changed = new Map();
document.querySelectorAll('input[data-row]').forEach(input => {
  if (input.value === 'NaN') input.closest('tr').classList.add('nan');
  input.addEventListener('input', () => { changed.set(Number(input.dataset.row), input.value); document.getElementById('dirty').textContent = changed.size + ' changed'; });
});
document.getElementById('load').addEventListener('click', () => vscode.postMessage({type:'select', datasourceIndex:Number(ds.value), archiveIndex:Number(arc.value)}));
document.getElementById('refresh').addEventListener('click', () => vscode.postMessage({type:'refresh'}));
document.getElementById('addByTimestamp').addEventListener('click', () => {
  const ts = Number(document.getElementById('addTs').value);
  const value = document.getElementById('addValue').value;
  if (!Number.isFinite(ts) || ts < archiveStart || ts > archiveEnd) { alert('Timestamp is outside the selected archive range.'); return; }
  const row = Math.round((ts - archiveStart) / archiveStep);
  if (row < 0 || row >= archiveRows) { alert('Timestamp cannot be mapped to a row in this archive.'); return; }
  const input = document.querySelector('input[data-row="' + row + '"]');
  if (!input) { alert('Target row not found.'); return; }
  input.value = value || 'NaN';
  changed.set(row, input.value);
  document.getElementById('dirty').textContent = changed.size + ' changed';
  input.scrollIntoView({block:'center'});
  input.focus();
});
document.getElementById('save').addEventListener('click', () => {
  const edits = [...changed.entries()].map(([row, value]) => ({ row, value: value.trim().toLowerCase() === 'nan' || value.trim() === '' ? null : Number(value), datasourceIndex:Number(ds.value), archiveIndex:Number(arc.value) })).filter(e => e.value === null || Number.isFinite(e.value));
  vscode.postMessage({type:'save', datasourceIndex:Number(ds.value), archiveIndex:Number(arc.value), expectedMtimeMs:${fileMtimeMs}, edits});
});
</script></body></html>`;
}

function getErrorHtml(error: unknown): string {
	let message = error instanceof Error ? error.message : String(error);
	return `<!doctype html><html><body><h2>openHAB RRD Inspector</h2><p style="color:red">${escapeHtml(message)}</p></body></html>`;
}

function escapeHtml(value: string): string {
	return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] || char));
}
