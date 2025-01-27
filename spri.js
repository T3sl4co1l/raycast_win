/* * * HTML ID Constants, Defaults * * */

const FILE_LOAD_IDS = {
	buttonLoad: "fileload",
	buttonParse: "fileparse",
	buttonRefresh: "fileref",
	buttonDownload: "filedl",
	fileInput: "filein",
	textOutput: "filetext",
	messageBox: "messagebox",
	options: "formatters",
	optprefix: "file"
};

const STORAGE_IDS = [
	"storslot",
	"storname",
	"storcolors",
	"storcolumns",
	"stornew",
	"storcopy",
	"stordel",
	"storcontainer"
];

const STOREBOX_CLASS = "storbox";
const STOREBOX_SEL_CLASS = "storboxsel";
const STOREBOX_ID_BASE = [
	"storbox", "storboxnum", "storboxname", "storboximg"
];
const STOREBOX_IMG_WIDTH = 32, STOREBOX_IMG_HEIGHT = 32;	//	note, sync with CSS rule ".storbox > :nth-child(3)"
const STORAGE_CAPACITY = 16;

const PALETTE_IDS = [
	"palmax",
	"palrem",
	"palidx",
	"palred",
	"palgre",
	"palblu",
	"palswatches",
	"palpatch",
	"pallist"
];

const PALETTE_DEFAULT = [
	"#000000", 	"#0000ff", 	"#00ad00", 	"#00d6d6", 
	"#00ff00", 	"#00ffff", 	"#525252", 	"#5252ff", 
	"#ad0000", 	"#ce00ce", 	"#cece00", 	"#d6d6d6", 
	"#ff0000", 	"#ff00ff", 	"#ffff00", 	"#ffffff"
];
const PALETTE_RAYCAST = [
	"#000000", "#0000aa", "#00aa00", "#00aaaa",
	"#aa0000", "#aa00aa", "#aa5500", "#aaaaaa",
	"#555555", "#5555ff", "#55ff55", "#55ffff",
	"#ff5555", "#ff55ff", "#ff5555", "#ffffff"
];
const PALETTE_EXPANDED = [
	"#000000", "#0000ad", "#0000ff", "#00ad00",
	"#00d6d6", "#00ff00", "#00ffff", "#08525a",
	"#1894ad", "#4a299c", "#4a6329", "#4a84ef",
	"#525252", "#5252ff", "#632121", "#9c00ff",
	"#ad0000", "#ad00ad", "#ad5200", "#adadad",
	"#adcef7", "#b5deef", "#ce00ce", "#cece00",
	"#d6d6d6", "#d6e7bd", "#f7adad", "#ff0000",
	"#ff00ff", "#ff9c00", "#ffff00", "#ffffff"
];

const PALETTE_CLASS = "palswatch";
const PALETTE_SEL_CLASS = "palswatchsel";
const PALETTE_ID_BASE = "palsw";
const PALETTE_CAPACITY = 256;

const COLUMN_IDS = [
	"coltotal",
	"colsel",
	"colpos",
	"editbox",
	"colins",
	"coldel",
	"fromcol",
	"specclone",
	"rowsel",
	"rowins",
	"rowdel",
	"rownum",
	"rowpos",
	"rowidx",
	"editor",
	"specnum"
];

const CURSOR_IDS = [
	"editclicktop",
	"editclickleft",
	"editclickbot",
	"editcurv1",
	"editcurv2",
	"editcurv3",
	"editcurh1",
	"editcurh2",
	"editcurh3",
	"editspeccur1",
	"editcurv2c",
	"editcurh2c",
	"editspeccur2"
];

/** Margin between editor container and image (see also: dimensions of "clickzone" selector) */
const EDITOR_MARGINS = { top: 30, left: 30 };
const EDITOR_IMAGE = { width: 512, height: 512 };	/**< Image dimensions */
const EDITOR_TICKMARK = 5;	/**< tickmark size in px */
const EDITOR_TICKCOLOR = "#606060";	/**< tickmark color */

const MESSAGE_COLORS = {
	normal: "#202020",
	error: "#ed0000"
}

/* * * Global Variables * * */

/** Mouse click/drag state */
var mouseClick = { xStart: 0, yStart: 0, down: false, shift: false, target: "", multiRows: [] };

/** Flag used if/when localStorage is unavailable */
storageNagged = false;

/** Current image (index in storage) */
var image = 2, maxImages = 3, rowSel = 0, specFrom = 0;

/** Stored images */
var storage = [
	{
		name: "new",
		palette: [
			"#ffffff",
			"#000000"
		],
		palIndex: 0,
		palMax: 2,
		columns: [
			{ pos: 0, spec: 0 }
		],
		colIndex: 0,
		colMax: 1,
		specs: [
			[	//	colspec 0
				{ pos: 0, idx: 0 }
			]
		],
	},
	{
		name: "TestBm",
		palette: [
			"#2a0b37", "#72710a", "#0012fe", "#3b52fd",
			"#7e02cc", "#5eb757", "#11ffc4", "#8b03c3",
			"#fa60bb", "#a2fe2a", "#c3b803", "#f9a369",
			"#fcdd4e", "#c6d5e6", "#000000", "#000000"
		],
		palIndex: 0,
		palMax: 14,
		columns: [
			{ pos: 102, spec: 0 }, { pos: 153, spec: 1 }, { pos: 166, spec: 2 },
			{ pos: 179, spec: 3 }, { pos: 192, spec: 4 }, { pos: 204, spec: 5 },
			{ pos:   0, spec: 6 }
		],
		colIndex: 0,
		colMax: 7,
		specs: [
			[	//	colspec 0
				{ pos: 128, idx:  2 }, { pos:   0, idx:  8 }
			],
			[	//	colspec 1
				{ pos: 128, idx:  9 }, { pos:   0, idx: 10 }
			],
			[	//	colspec 2
				{ pos:  64, idx:  9 }, { pos:  80, idx:  4 }, { pos:  96, idx:  0 },
				{ pos: 112, idx:  1 }, { pos: 128, idx:  9 }, { pos:   0, idx: 10 }
			],
			[	//	colspec 3
				{ pos:  64, idx:  9 }, { pos:  80, idx:  5 }, { pos:  96, idx:  6 },
				{ pos: 112, idx:  7 }, { pos: 128, idx:  9 }, { pos:   0, idx: 10 }
			],
			[	//	colspec 4
				{ pos:  64, idx:  9 }, { pos:  80, idx:  3 }, { pos:  96, idx: 12 },
				{ pos: 112, idx: 11 }, { pos: 128, idx:  9 }, { pos:   0, idx: 10 }
			],
			[	//	colspec 5
				{ pos: 128, idx:  9 }, { pos:   0, idx: 10 }
			],
			[	//	colspec 6
				{ pos:   0, idx: 13 }
			]
		],
	},
	{
		name: "Tableau I",
		palette: [
			"#130911", "#292d77", "#f44c3e", "#e7b42a",
			"#c3c3be", "#c5c5c0", "#cfcfcf", "#ceccd7",
			"#d8d6ca", "#d2d2d7", "#e0dcdb"
		],
		palIndex: 2,
		palMax: 11,
		columns: [
			{ pos:  22, spec: 0 }, { pos:  26, spec: 1 }, { pos: 114, spec: 2 },
			{ pos: 118, spec: 3 }, { pos: 187, spec: 4 }, { pos: 214, spec: 5 },
			{ pos: 218, spec: 6 }, { pos:   0, spec: 7 }
		],
		colIndex: 0,
		colMax: 8,
		specs: [
			[	//	colspec 0
				{ pos:   4, idx:  2 }, { pos:   8, idx:  0 }, { pos: 137, idx: 10 }, { pos: 141, idx:  0 }, { pos:   0, idx:  7 }
			],
			[	//	colspec 1
				{ pos:   4, idx:  2 }, { pos:   8, idx:  0 }, { pos: 137, idx: 10 }, { pos: 254, idx:  0 }, { pos:   0, idx:  7 }
			],
			[	//	colspec 2
				{ pos:   4, idx:  2 }, { pos:   8, idx:  0 }, { pos: 137, idx: 10 }, { pos: 141, idx:  0 }, { pos: 204, idx:  1 },
				{ pos: 209, idx:  0 }, { pos: 245, idx:  9 }, { pos: 249, idx:  0 }, { pos:   0, idx:  7 }
			],
			[	//	colspec 3
				{ pos: 249, idx:  0 }, { pos:   0, idx:  7 }
			],
			[	//	colspec 4
				{ pos: 137, idx:  6 }, { pos: 141, idx:  0 }, { pos: 245, idx:  8 }, { pos: 249, idx:  0 }, { pos:   0, idx:  7 }
			],
			[	//	colspec 5
				{ pos: 137, idx:  6 }, { pos: 141, idx:  0 }, { pos: 245, idx:  8 }, { pos:   0, idx:  0 }
			],
			[	//	colspec 6
				{ pos:   0, idx:  0 }
			],
			[	//	colspec 7
				{ pos:  24, idx:  0 }, { pos: 105, idx:  5 }, { pos: 109, idx:  0 }, { pos: 137, idx:  4 }, { pos: 141, idx:  0 },
				{ pos:   0, idx:  3 }
			]
		],
	}
];


/* * * Functions * * */

/* * * Event Handlers and Initialization * * */

document.addEventListener("DOMContentLoaded", function() {

	//	check local storage
	var ls = localStorage.getItem("imgstore");
	var errs = "";
	if (ls !== null) {
		ls = JSON.parse(ls);
		if (Array.isArray(ls) && ls.length >= 1) {
			var tempStorage = [];
			for (var i = 0; i < ls.length; i++) {
				//	validate as array of images; discard any in error
				try {
					tempStorage.push(newImage(ls[i]));
				} catch (e) {
					if (errs) errs += "; ";
					errs += e.message;
					continue;
				}
			}
			if (tempStorage.length > 0) {
				storage = tempStorage;
				image = 0; maxImages = storage.length;
			}
			if (errs) {
				setError("Some errors occurred retrieving localStorage: " + errs);
			}
		}
	}
	
	//	Storage controls
	storageInit();

	//	Palette controls
	paletteInit();

	//	Set up the color picker list
	var s = "";
	for (var i = 0; i < PALETTE_DEFAULT.length; i++) {
		s += "<option value=\"" + PALETTE_DEFAULT[i] + "\"></option>";
	}
	document.getElementById(PALETTE_IDS[8]).innerHTML = s;

	//	Fixup Firefox border offset bug
	if (typeof mozInnerScreenX !== 'undefined' || typeof InstallTrigger !== 'undefined') {
		document.getElementById(COLUMN_IDS[14]).style.top = "1px";
		document.getElementById(COLUMN_IDS[14]).style.left = "1px";
	}

	//	Set up formatters
	var first = true, el, el2;
	var p = document.getElementById(FILE_LOAD_IDS.options);
	for (const fmt in FORMATTERS) {
		//	Create elements of the form:
		//	"<div class=\"tablksr\"><input type=\"radio\" name=\"filefmt\" id=\"file${fmt}\"
		//	${checked}><label class=\"radio\" for=\"file{fmt}\">${FORMATTERS[fmt].label}</label></div>"
		el = document.createElement("div");
		el.setAttribute("class", "tablksr");
		el2 = document.createElement("input");
		el2.setAttribute("type", "radio");
		el2.setAttribute("name", "filefmt");
		el2.setAttribute("id", FILE_LOAD_IDS.optprefix + fmt);
		if (first) {
			el2.setAttribute("checked", "");
			first = false;
		}
		el.appendChild(el2);
		el2 = document.createElement("label");
		el2.setAttribute("class", "radio");
		el2.setAttribute("for", FILE_LOAD_IDS.optprefix + fmt);
		el2.appendChild(document.createTextNode(FORMATTERS[fmt].label));
		el.appendChild(el2);
		p.appendChild(el);
	}

	//	File load stuff
	document.getElementById(FILE_LOAD_IDS.buttonLoad).addEventListener("click", loadFile);
	document.getElementById(FILE_LOAD_IDS.buttonParse).addEventListener("click", loadTextbox);
	document.getElementById(FILE_LOAD_IDS.buttonRefresh).addEventListener("click", saveTextbox);
	document.getElementById(FILE_LOAD_IDS.buttonDownload).addEventListener("click", saveFile);
	
	//	Storage handlers
	document.getElementById(STORAGE_IDS[0]).addEventListener("change", storageSlot);
	document.getElementById(STORAGE_IDS[1]).addEventListener("change", storageName);
	document.getElementById(STORAGE_IDS[4]).addEventListener("click", storageNew);
	document.getElementById(STORAGE_IDS[5]).addEventListener("click", storageCopy);
	document.getElementById(STORAGE_IDS[6]).addEventListener("click", storageDel);

	//	Palette handlers
	document.getElementById(PALETTE_IDS[0]).addEventListener("change", paletteMax);
	document.getElementById(PALETTE_IDS[1]).addEventListener("click", paletteOptimize);
	document.getElementById(PALETTE_IDS[2]).addEventListener("change", paletteIndex);
	document.getElementById(PALETTE_IDS[3]).addEventListener("change", paletteColor);
	document.getElementById(PALETTE_IDS[4]).addEventListener("change", paletteColor);
	document.getElementById(PALETTE_IDS[5]).addEventListener("change", paletteColor);
	document.getElementById(PALETTE_IDS[7]).addEventListener("input", paletteColor);
	document.getElementById(PALETTE_IDS[7]).addEventListener("change", paletteColor);

	//	Editor handlers
	document.getElementById(COLUMN_IDS[1]).addEventListener("change", editorIndex);
	document.getElementById(COLUMN_IDS[2]).addEventListener("change", editorPosition);
	document.getElementById(COLUMN_IDS[3]).addEventListener("mousedown", editorMousedown);
	document.getElementById(COLUMN_IDS[3]).addEventListener("mousemove", editorMousedown);
	document.addEventListener("mouseup", editorMousedown, true);
	document.getElementById(COLUMN_IDS[4]).addEventListener("click", editorCopy);
	document.getElementById(COLUMN_IDS[5]).addEventListener("click", editorDelete);
	document.getElementById(COLUMN_IDS[6]).addEventListener("change", editorFrom);
	document.getElementById(COLUMN_IDS[7]).addEventListener("click", editorSpecClone);
	document.getElementById(COLUMN_IDS[8]).addEventListener("change", editorSelect);
	document.getElementById(COLUMN_IDS[9]).addEventListener("click", editorRowInsert);
	document.getElementById(COLUMN_IDS[10]).addEventListener("click", editorRowDelete);
	document.getElementById(COLUMN_IDS[12]).addEventListener("change", editorRowPosition);
	document.getElementById(COLUMN_IDS[13]).addEventListener("change", editorRowColor);

	editorUpdateCanvas();
});

document.addEventListener("visibilitychange", function() {
	if (document.visibilityState == "hidden") {
		if (storageAvailable("localStorage")) {
			//	Make a backup before we disappear into the nether
			var tmpstg = [];
			for (var i = 0; i < maxImages; i++) {
				//	quick and dirty deep clone thru JSON
				tmpstg.push(JSON.parse(JSON.stringify(storage[i],
					["name", "palette", "columns", "specs", "pos", "spec", "idx"])));
			}
			localStorage.setItem("imgstore", JSON.stringify(tmpstg));
		} else if (!storageNagged) {
			alert("Warning: localStorage not available. Data may be lost on closing this page.");
			storageNagged = true;
		}
	}

	/**
	 *	Using reference from:
	 *	https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
	 */
	function storageAvailable(type) {
		let storage;
		try {
			storage = window[type];
			const x = "__storage_test__";
			storage.setItem(x, x);
			storage.removeItem(x);
			return true;
		} catch (e) {
			return (
				e instanceof DOMException &&
				e.name === "QuotaExceededError" &&
				// acknowledge QuotaExceededError only if there's something already stored
				storage &&
				storage.length !== 0
			);
		}
	}

});

/**
 *	Sets the message box to a normal status message (black color).
 */
function setMessage(s) {
	var mb = document.getElementById(FILE_LOAD_IDS.messageBox);
	mb.style.color = MESSAGE_COLORS.normal;
	while (mb.firstChild)
		mb.removeChild(mb.firstChild);
	mb.appendChild(document.createTextNode(s));
}

/**
 *	Sets the message box to an error message (red color).
 */
function setError(s) {
	var mb = document.getElementById(FILE_LOAD_IDS.messageBox);
	mb.style.color = MESSAGE_COLORS.error;
	while (mb.firstChild)
		mb.removeChild(mb.firstChild);
	mb.appendChild(document.createTextNode(s));
}

/**
 *	Load File button clicked
 */
function loadFile(e) {
	//	Sanity checks
	var f = document.getElementById(FILE_LOAD_IDS.fileInput).files;
	if (f.length != 1) {
		setError("Select a single file.");
		return;
	}
	//	What type of file are we loading
	var key = "";
	document.getElementsByName("filefmt").forEach( el => {
		if (el.checked) key = el.id.slice(FILE_LOAD_IDS.optprefix.length);
	} );
	if (key == "") {
		setError("Select a file format.");
		return;
	}
	//	Seems OK, read the file
	var fr = new FileReader();
	fr.onload = function() { loadFormatArray(this.result, key, f[0].name); };
	fr.onerror = function(e) {
		setError("File read error: " + e.message);
	};
	fr.readAsArrayBuffer(f[0]);
}

/**
 *	Converts an array of data, in the specified format, into an image
 *	structure, storing it using storageAdd().
 *	@param r     ArrayData to convert
 *	@param fmt   string, key into FORMATTERS[]
 *	@param name  string, name to give the image
 */
function loadFormatArray(r, fmt, name) {

	//	Got the data, is there a place for it?
	if (maxImages >= STORAGE_CAPACITY) {
		setError("No free slots.");
		return;
	}
	var a = new Uint8Array(r);
	var im;
	try {
		im = FORMATTERS[fmt].load(a);
		if (im instanceof Promise) {
			im.then(loadRes).catch(loadErr);
		} else {
			loadRes(im);
		}

		//	Make a copy to prune data and validate structure
	} catch (e) {
		loadErr(e);
		setError("File loading/format error: " + e.message);
		return;
	}

	function loadRes(img) {
		img = newImage(img);
		name = String(name || "blank").trim().substring(0, 24);	//	limit to 24 chars max for clarity
		img.name = img.name || name;
		storageAdd(img);
		setMessage("Load success.");
	}
	function loadErr(e) {
		setError("File loading/format error: " + e.message);
		return;
	}
}

//	buttonLoad: "fileload",
//	buttonParse: "fileparse",
//	buttonRefresh: "fileref",
//	buttonDownload: "filedl",
//	options: {crl: "filecrl", csv: "filecsv", json: "filejson", png: "fileimg", hdr: "filehdr"}

/**
 *	Parse button clicked
 */
function loadTextbox(e) {
	//	What are we parsing
	var key = "";
	document.getElementsByName("filefmt").forEach( el => {
		if (el.checked) key = el.id.slice(FILE_LOAD_IDS.optprefix.length);
	} );
	if (key == "") {
		setError("Select a file format.");
		return;
	}
	if (!FORMATTERS[key].supportsAscii) {
		setError("Text input not supported for this format.");
		return;
	}
	var s = document.getElementById(FILE_LOAD_IDS.textOutput).value;
	loadFormatArray((new TextEncoder()).encode(s), key);
}

/**
 *	Download button clicked
 */
function saveFile(e) {
	//	Refresh data source first...
	var key = "";
	document.getElementsByName("filefmt").forEach( el => {
		if (el.checked) key = el.id.slice(FILE_LOAD_IDS.optprefix.length);
	} );
	if (key == "") {
		setError("Select a file format.");
		return;
	}
	var r = FORMATTERS[key].save(storage[image]);
	if (r instanceof Promise)
		r.then(saveRes);
	else
		saveRes(r);

	function saveRes(r) {
		document.getElementById(FILE_LOAD_IDS.textOutput).value = r.asc;
		var a = document.createElement("a");
		a.target = "_blank";
		a.href = r.url;
		a.download = storage[image].name + FORMATTERS[key].extension;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setMessage("Saved.");
	}
}

/* * * Storage Controls Handlers * * */

/**
 *	Refresh button clicked
 */
function saveTextbox(e) {
	//	What are we refreshing
	var key = "";
	document.getElementsByName("filefmt").forEach( el => {
		if (el.checked) key = el.id.slice(FILE_LOAD_IDS.optprefix.length);
	} );
	if (key == "") {
		setError("Select a file format.");
		return;
	}
	var r = FORMATTERS[key].save(storage[image]);
	if (r instanceof Promise)
		r.then(saveText);
	else
		saveText(r);

	function saveText(res) {
		document.getElementById(FILE_LOAD_IDS.textOutput).value = res.asc;
		setMessage("Refreshed.");
	}
}

//	STORAGE_IDS
//	"storslot"
//	"storname"
//	"storcolors"
//	"storcolumns"
//	"stornew"
//	"storcopy"
//	"stordel"
//	"storcontainer"

/**
 *	Clear and repopulate the storage container element from current image storage,
 *	and set the other storage controls.
 */
function storageInit() {
	var c = document.getElementById(STORAGE_IDS[7]);	//	"storcontainer"
	while (c.childNodes.length > 0)
		c.removeChild(c.childNodes[0]);
	for (var i = 0; i < storage.length; i++) {
		var e = newBox(i, storage[i].name, storage[i]);
		e.addEventListener("click", storageSelect, true);
		c.appendChild(e);
	}

	maxImages = storage.length;
	c = document.getElementById(STORAGE_IDS[0]);	//	"storslot"
	c.max = String(maxImages - 1);
	image = Math.max(Math.min(maxImages - 1, image), 0);
	c.value = String(image);
	storageSetSlot(image);
}

/**
 *	A storage box has been clicked
 */
function storageSelect(e) {
	e.preventDefault();
	if (e.currentTarget.id.substring(0, STOREBOX_ID_BASE[0].length) != STOREBOX_ID_BASE[0]) {
		console.log("Event fired on non-storbox element " + e.currentTarget.id);
		return;
	}
	var idx = Number.parseInt(e.currentTarget.id.substring(STOREBOX_ID_BASE[0].length))
	if (isNaN(idx) || idx < 0 || idx >= maxImages) {
		console.log("Can't select storage index " + idx);
		return;
	}
	storageSetSlot(idx);
	setMessage("Selected " + image + ".");
}

/**
 *	Storage slot number has been changed
 */
function storageSlot(e) {
	if (e.currentTarget.id.substring(0, STORAGE_IDS[0].length) != STORAGE_IDS[0]) {
		console.log("Event fired on non-" + STORAGE_IDS[0] + " element " + e.currentTarget.id);
		return;
	}
	var idx = e.currentTarget.value;
	if (idx === "") {
		document.getElementById(STORAGE_IDS[0]).value = String(image);
		return;
	}
	storageSetSlot(idx);
	setMessage("Selected " + idx + ".");
}

/**
 *	Selects a storage box.
 */
function storageSetSlot(idx) {
	idx = Math.max(Math.min(idx, maxImages - 1), 0);
	image = idx;
	for (var i = 0; i < maxImages; i++) {
		document.getElementById(STOREBOX_ID_BASE[0] + String(i))?.setAttribute("class",
			STOREBOX_CLASS + (i == idx ? (" " + STOREBOX_SEL_CLASS) : "")
		);
	}
	document.getElementById(STORAGE_IDS[0]).value = String(idx);
	document.getElementById(STORAGE_IDS[1]).value = String(storage[idx].name);
	document.getElementById(STORAGE_IDS[2]).innerHTML = String(storage[idx].palMax);
	document.getElementById(STORAGE_IDS[3]).innerHTML = String(storage[idx].colMax);
	paletteInit();
	editorInit();
}

/**
 *	Storage slot name has been changed
 */
function storageName(e) {
	//	limit to 24 chars max for clarity
	var s = String(e.target.value).trim().substring(0, 24) || "blank";
	//	TODO: scrub filename-unsafe chars as well
	e.target.value = s;
	var el = document.getElementById(STOREBOX_ID_BASE[2] + String(image));
	while (el.firstChild)
		el.removeChild(el.firstChild);
	el.appendChild(document.createTextNode(s));
	storage[image].name = s;
	setMessage("Renamed.");
}

/**
 *	Storage "New" button pressed
 */
function storageNew(e) {
	var im = newImage();
	im.name = "blank";
	if (storageAdd(im))
		setMessage("New image.");
	else
		setError("No free slots.");
}

/**
 *	Storage "Copy" button pressed
 */
function storageCopy(e) {
	if (storageAdd(newImage(storage[image])))
		setMessage("Copied image.");
	else
		setError("No free slots.");
}

/**
 *	Storage "Delete" button pressed
 */
function storageDel(e) {
	if (image <= 0 && maxImages <= 1) {
		var im = newImage();
		im.name = "blank";
		storageAdd(im);
		storageRemove(0);
	} else {
		storageRemove(image);
	}
	setMessage("Image deleted.");
}

/**
 *	Adds a new image to the storage list, updating the "storcontainer" DOM structure.
 *	Returns false if out of room, true if successful.
 */
function storageAdd(im) {
	//	Is there room?
	if (maxImages >= STORAGE_CAPACITY)
		return false;
	var e = newBox(maxImages, im.name, im);
	e.addEventListener("click", storageSelect, true);
	document.getElementById(STORAGE_IDS[7]).appendChild(e);	//	"storcontainer"
	storage.splice(maxImages, 0, im);
	maxImages++;
	document.getElementById(STORAGE_IDS[0]).max = maxImages - 1;	//	"storslot"
	storageSetSlot(maxImages - 1);
	return true;
}

/**
 *	Removes the indexed image from the storage list, updating the "storcontainer"
 *	DOM structure.  Removing the last remaining item is not allowed.
 */
function storageRemove(idx) {
	idx = Number(idx);
	if (isNaN(idx) || idx >= maxImages || idx < 0 || maxImages <= 1)
		return 0;	//	Can't remove 
	var e = document.getElementById(STOREBOX_ID_BASE[0] + String(idx));
	e.removeEventListener("click", storageSelect, true);
	e.remove();
	//	Renumber the remainder
	for (var i = idx + 1; i < maxImages; i++) {
		e = document.getElementById(STOREBOX_ID_BASE[0] + String(i));
		e.setAttribute("id", STOREBOX_ID_BASE[0] + String(i - 1));
		e = document.getElementById(STOREBOX_ID_BASE[1] + String(i));
		e.setAttribute("id", STOREBOX_ID_BASE[1] + String(i - 1));
		e.innerHTML = String(i - 1);
		e = document.getElementById(STOREBOX_ID_BASE[2] + String(i));
		e.setAttribute("id", STOREBOX_ID_BASE[2] + String(i - 1));
		e = document.getElementById(STOREBOX_ID_BASE[3] + String(i));
		e.setAttribute("id", STOREBOX_ID_BASE[3] + String(i - 1));
	}
	var im = storage.splice(idx, 1)[0];
	//	Don't actually delete, but keep a copy linked for undeleting (manually check storage array in console or TODO)
	storage.push(im);
	maxImages--;
	//	set the new slot limit
	document.getElementById(STORAGE_IDS[0]).max = maxImages - 1;
	//	In case we deleted the selection, select a new box in the same place, or one less if at the end
	storageSetSlot(idx);
	return 1;
}

/* * * Palette Controls Handlers * * */

/**
 *	Clear and repopulate the palette swatches element from the current selection (storage[image]),
 *	and set the other palette controls.
 */
function paletteInit() {
	//	Clear the swatches box and repopulate
	var c = document.getElementById(PALETTE_IDS[6]);	//	"palswatches"
	while (c.childNodes.length > 0) {
		c.childNodes[0].removeEventListener("click", paletteSelect, true);
		c.removeChild(c.childNodes[0]);
	}
	for (var i = 0; i < storage[image].palMax; i++) {
		var e = newSwatch(i, storage[image].palette[i]);
		c.appendChild(e);
	}
	/*	Optional: populate color picker with current palette entries  */
//	c = document.getElementById(PALETTE_IDS[8]);	//	"pallist"
//	while (c.childNodes.length > 0)
//		c.removeChild(c.childNodes[0]);
//	for (var i = 0; i < storage[image].palMax; i++) {
//		var e = document.createElement("option");
//		e.setAttribute("value", storage[image].palette[i]);
//		c.appendChild(e);
//	}
	paletteSetIndex(storage[image].palIndex);
}

/**
 *	A palette swatch has been clicked.
 */
function paletteSelect(e) {
	e.preventDefault();
	if (e.currentTarget.id.substring(0, PALETTE_ID_BASE.length) != PALETTE_ID_BASE) {
		console.log("Event fired on non-palsw element " + e.currentTarget.id);
		return;
	}
	var idx = Number.parseInt(e.currentTarget.id.substring(PALETTE_ID_BASE.length))
	if (isNaN(idx) || idx < 0 || idx >= storage[image].palMax) {
		console.log("Can't select palette index " + idx);
		return;
	}
	paletteSetIndex(idx);
}

/**
 *	Selects a palette swatch, and updates the palette controls accordingly.
 */
function paletteSetIndex(idx) {
	idx = Math.max(Math.min(idx, storage[image].palMax - 1), 0);
	//	Select swatch, deselect the rest
	for (var i = 0; i < storage[image].palMax; i++) {
		document.getElementById(PALETTE_ID_BASE + String(i))?.setAttribute("class",
			PALETTE_CLASS + (i == idx ? (" " + PALETTE_SEL_CLASS) : "")
		);
	}
	storage[image].palIndex = idx;
	//	controls
	document.getElementById(PALETTE_IDS[0]).value = String(storage[image].palMax);	//	palmax
	document.getElementById(PALETTE_IDS[2]).value = String(idx);	//	palidx
	document.getElementById(PALETTE_IDS[2]).max = String(storage[image].palMax - 1);
	var c = Number.parseInt(storage[image].palette[idx].substring(1, 7), 16);
	document.getElementById(PALETTE_IDS[3]).value = String((c >> 16) & 0xff);	//	palred
	document.getElementById(PALETTE_IDS[4]).value = String((c >>  8) & 0xff);	//	palgre
	document.getElementById(PALETTE_IDS[5]).value = String((c >>  0) & 0xff);	//	palblu
	document.getElementById(PALETTE_IDS[7]).value = String(storage[image].palette[idx]);	//	palpatch
}

/**
 *	Color count changed: add or remove [accessible] palette entries.
 */
function paletteMax(e) {
	if (e.currentTarget.id.substring(0, PALETTE_IDS[0].length) != PALETTE_IDS[0]) {
		console.log("Event fired on non-" + PALETTE_IDS[0] + " element " + e.currentTarget.id);
		return;
	}
	var pm = e.currentTarget.value;
	if (pm == "") {
		e.currentTarget.value = String(storage[image].palMax);
		return;
	}
	pm = Math.max(Math.min(pm, PALETTE_CAPACITY), 2);
	if (pm < storage[image].palMax) {
		//	How many can we actually delete?
		var pUsed = 0;
		for (var i = 0; i < storage[image].specs.length; i++) {
			storage[image].specs[i].forEach(sp => { pUsed = Math.max(pUsed, sp.idx); } );
		}
		if (pm <= pUsed) {
			setError("Attribute " + String(pUsed) + " in use.");
			pm = pUsed + 1;
		} else {
			if (pm == storage[image].palMax - 1)
				setMessage("Removed attribute " + String(pm));
			else
				setMessage("Removed attributes " + String(pm) + " to " + String(storage[image].palMax - 1));
		}
		//	Shrink the visible list; leave excess palette entries alone (we're not really deleting them)
		for (var i = pm; i < storage[image].palMax; i++) {
			removeSwatch(i);
		}
	} else if (pm > storage[image].palMax) {
		//	grow visible list; if there are existing entries, show them first
		if (pm > storage[image].palette.length) {
			//	need to fill brand new entries; make default white
			for (var i = storage[image].palette.length; i < pm; i++) {
				storage[image].palette.push("#ffffff");
			}
		}
		var c = document.getElementById(PALETTE_IDS[6]);	//	"palswatches"
		for (var i = storage[image].palMax; i < pm; i++) {
			c.appendChild(newSwatch(i, storage[image].palette[i]));
		}
		if (pm == storage[image].palMax + 1)
			setMessage("Added attribute " + String(pm - 1));
		else
			setMessage("Added attributes " + String(storage[image].palMax) + " to " + String(pm - 1));
	}
	storage[image].palMax = pm;
	document.getElementById(STORAGE_IDS[2]).innerHTML = String(pm);
	document.getElementById(COLUMN_IDS[13]).max = pm;
	//	If shrinking below current selection, select the max instead
	storage[image].palIndex = Math.min(storage[image].palIndex, pm - 1);
	paletteSetIndex(storage[image].palIndex);
}

/**
 *	Palette index control changed.
 */
function paletteIndex(e) {
	if (e.currentTarget.id.substring(0, PALETTE_IDS[2].length) != PALETTE_IDS[2]) {
		console.log("Event fired on non-" + PALETTE_IDS[2] + " element " + e.currentTarget.id);
		return;
	}
	var idx = e.currentTarget.value;
	if (idx === "") {
		e.currentTarget.value = String(storage[image].palIndex);
		return;
	}
	paletteSetIndex(idx);
}
//	PALETTE_IDS
//	0	"palmax",
//	1	"palrem",
//	2	"palidx",
//	3	"palred",
//	4	"palgre",
//	5	"palblu",
//	6	"palswatches",
//	7	"palpatch",
//	8	"pallist"

/**
 *	R, G, B or color controls changed.
 */
function paletteColor(e) {
	if (e.currentTarget.id != PALETTE_IDS[3] &&
			e.currentTarget.id != PALETTE_IDS[4] &&
			e.currentTarget.id != PALETTE_IDS[5] &&
			e.currentTarget.id != PALETTE_IDS[7]) {
		console.log("Event fired on non-color element " + e.currentTarget.id);
		return;
	}
	var shift, c;
	if (e.currentTarget.id == PALETTE_IDS[3]) {       	//	palred
		shift = 16;
	} else if (e.currentTarget.id == PALETTE_IDS[4]) {	//	palgre
		shift = 8;
	} else if (e.currentTarget.id == PALETTE_IDS[5]) {	//	palblu
		shift = 0;
	}
	//	assume color input/change event
	if (e.currentTarget.id == PALETTE_IDS[7]) {	//	palpatch
		c = e.currentTarget.value;
		clr = Number.parseInt(c.substring(1, 7), 16);
		//	change RGB numbers as a result
		document.getElementById(PALETTE_IDS[3]).value = String((clr >> 16) & 0xff);	//	palred
		document.getElementById(PALETTE_IDS[4]).value = String((clr >>  8) & 0xff);	//	palgre
		document.getElementById(PALETTE_IDS[5]).value = String((clr >>  0) & 0xff);	//	palblu
	} else {
		//	R/G/B change event
		c = Number.parseInt(storage[image].palette[storage[image].palIndex].substring(1, 7), 16);
		var val = e.currentTarget.value;
		if (val == "") {
			//	invalid value, restore from palette (no other changes)
			e.currentTarget.value = String((c >> shift) & 0xff);
			return;
		}
		//	valid value, replace respective byte in color
		val = Math.max(Math.min(val, 255), 0);
		e.currentTarget.value = String(val);
		c = (c & ~(0xff << shift)) | (val << shift);
		c = "#" + ("00000" + c.toString(16)).slice(-6);
		document.getElementById(PALETTE_IDS[7]).value = c;
	}
	storage[image].palette[storage[image].palIndex] = c;
	document.getElementById(PALETTE_ID_BASE + String(storage[image].palIndex))
		.setAttribute("style", "background-color: " + c + ";");
	editorUpdateIndex(storage[image].palIndex);
	updateBox(image);
	if (e.type == "change" && e.currentTarget.id == PALETTE_IDS[7]) {
		//	color selected in dialog, save as recent entry
		list = document.getElementById(PALETTE_IDS[8]);	//	"pallist"
		//	remove first matching if present, otherwise shift the queue
		var rem = list.childNodes[0];
		for (var i = 0; i < list.childNodes.length; i++) {
			if (list.childNodes[i].value == c) {
				rem = list.childNodes[i];
				break;
			}
		}
		list.removeChild(rem);
		var el = document.createElement("option");
		el.setAttribute("value", c);
		list.appendChild(el);
	}
}

/**
 *	Sort button clicked.
 */
function paletteOptimize(e) {
	var histo = [];
	for (var i = 0; i < storage[image].palMax; i++) {
		histo.push( { idx: i, cnt: 0 } );
	}
	for (var i = 0; i < storage[image].specs.length; i++) {
		storage[image].specs[i].forEach( sp => histo[sp.idx].cnt++ );
	}
	histo.sort((a, b) => b.cnt - a.cnt);
	//	Change over the image's palette...
	var p = [];
	for (var i = 0; i < histo.length; i++)
		p.push(storage[image].palette[histo[i].idx]);
	storage[image].palette = p;
	//	...and remap the indices. Sort creates the inverse mapping, invert it first
	var m = Array(storage[image].palMax);
	for (var i = 0; i < histo.length; i++)
		m[histo[i].idx] = i;
	for (var i = 0; i < storage[image].specs.length; i++) {
		storage[image].specs[i].forEach( sp => sp.idx = m[sp.idx] );
	}
	var s = "Palette sorted. Most used attributes (number of times): ";
	s += String(histo[0].cnt) + ", " + String(histo[1].cnt) + ".  Unused: "
		+ String(histo.filter( h => h.cnt == 0 ).length);
	setMessage(s);
	//	Show change on DOM elements
	for (var i = 0; i < storage[image].palMax; i++)
		document.getElementById(PALETTE_ID_BASE + String(i))
			.setAttribute("style", "background-color: " + p[i] + ";");
	paletteSetIndex(storage[image].palIndex);
	editorUpdateSpec();
}

/* * *	Editor Controls Handlers * * */

/**
 *	Set the editor controls and refresh the canvas from the selected image.
 */
function editorInit() {
	document.getElementById(COLUMN_IDS[0]).innerHTML = String(storage[image].colMax);	//	"coltotal"
	editorUpdateCol(storage[image].colIndex);
	document.getElementById(COLUMN_IDS[2]).max = storage[image].columns[storage[image].colIndex].pos;
	document.getElementById(COLUMN_IDS[6]).max = storage[image].colMax - 1;
	editorChangeColumn(storage[image].colIndex);
	editorUpdateCanvas();
	specFrom = Math.max(Math.min(storage[image].colMax - 1, 
			document.getElementById(COLUMN_IDS[6]).value), 0);
	editorSetSpecCursor(specFrom);
	document.getElementById(COLUMN_IDS[5]).disabled = (storage[image].colMax <= 1);	//	"coldel"
}
//	COLUMN_IDS  []	event func
//	"coltotal"   0	(output field)
//	"colsel"     1	editorIndex
//	"colpos"     2	editorPosition
//	"colnew"     3	editorNew
//	"colins"     4	editorCopy
//	"coldel"     5	editorDelete
//	"fromcol"    6	editorFrom
//	"specclone"  7	editorSpecClone
//	"rowsel"     8	editorSelect
//	"rowins"     9	editorRowInsert
//	"rowdel"    10	editorRowDelete
//	"rownum"    11	(output field)
//	"rowpos"    12	editorRowPosition
//	"rowidx"    13	editorRowColor
//	"editor"    14	(output canvas)
//	"specnum"   15	(output field)

/**
 *	Selected column index changed.
 */
function editorIndex(e) {
	var idx = e.currentTarget.value;
	if (idx === "") {
		e.currentTarget.value = String(storage[image].colIndex);
		return;
	}
	editorChangeColumn(Number.parseInt(idx));
	editorUpdateCanvas();
}

/**
 *	Column position changed.
 */
function editorPosition(e) {
	const ci = storage[image].colIndex;
	var p = e.currentTarget.value;
	if (p == "") {
		e.currentTarget.value = storage[image].columns[ci].pos;
		return;
	}
	var max = 255, min = 1;
	if (ci < storage[image].colMax - 2)
		max = storage[image].columns[ci + 1].pos - 1;
	if (ci >= 1)
		min = storage[image].columns[ci - 1].pos + 1;
	p = Math.max(Math.min(max, p), min);
	if (ci == storage[image].colMax - 1)
		p = 0;
	storage[image].columns[ci].pos = p;
	e.currentTarget.value = p;
	editorUpdateCanvas();
	updateBox(image);
	if (ci == specFrom || ci + 1 == specFrom)
		editorSetSpecCursor(specFrom);
	if (ci != storage[image].colMax - 1)
		editorSetVCursors(true, min - 1, p, max + 1);
	//	Disable split button if too thin
	p = storage[image].columns[ci].pos, min = 0;
	if (p <= 0 || p > 256) p = 256;
	if (ci >= 1) min = storage[image].columns[ci - 1].pos;
	document.getElementById(COLUMN_IDS[4]).disabled = (p - min <= 1);	//	"colins"
	var s =   ( "   " + String(ci)).slice(-3) + ":"
			+ ("    " + String(storage[image].columns[ci].pos)).slice(-4);
	s = s.replace(/ /g, "&nbsp;");
	document.getElementById(COLUMN_IDS[1]).childNodes[ci + 1].innerHTML = s;
}

/**
 *	Split column button clicked.
 */
function editorCopy(e) {
	const ci = storage[image].colIndex;
	const colu = storage[image].columns;
	//	is there room?
	var x1 = 0, x2 = 256;
	if (ci >= 1)
		x1 = colu[ci - 1].pos;
	if (colu[ci].pos > 0 && colu[ci].pos < 256)
		x2 = colu[ci].pos;
	if (x2 - x1 <= 1)
		return;
	const specs = storage[image].specs;
	const si = Math.min(ci, specs.length);
	var sp = colu[ci].spec;
	//	shift spec indices before insertion
	for (var i = 0; i < colu.length; i++) {
		if (colu[i].spec >= si) colu[i].spec++;
	}
	colu.splice(ci, 0, {pos: Math.floor((x1 + x2) / 2), spec: sp});
	const newSpec = [];
	for (var i = 0; i < specs[sp].length; i++)
		newSpec.push({pos: specs[sp][i].pos, idx: specs[sp][i].idx});
	specs.splice(si, 0, newSpec);
	storage[image].colMax++;
	editorInit();
	document.getElementById(STORAGE_IDS[3]).innerHTML = String(storage[image].colMax);	//	"storcolumns"
}

/**
 *	Delete column button clicked.
 */
function editorDelete(e) {
	if (storage[image].colMax <= 1) return;
	
	const ci = storage[image].colIndex;
	const colu = storage[image].columns;
	//	Remove the column; leave the spec behind, unlinked
	//	(it can be restored by manually setting a column[idx].spec to that index and editorInit()ing)
	colu.splice(ci, 1);
	if (ci >= colu.length) {
		storage[image].colIndex = colu.length - 1;
		colu[ci - 1].pos = 0;
	}
	storage[image].colMax--;
	editorInit();
	document.getElementById(STORAGE_IDS[3]).innerHTML = String(storage[image].colMax);	//	"storcolumns"
}

/**
 *	Spec-from number changed.
 */
function editorFrom(e) {
	var idx = e.currentTarget.value;
	if (idx === "") {
		e.currentTarget.value = specFrom;
		return;
	}
	specFrom = Math.max(Math.min(storage[image].colMax - 1, idx), 0);
	editorSetSpecCursor(specFrom);
}

/**
 *	Clone specs button clicked.
 */
function editorSpecClone(e) {
	if (specFrom == storage[image].colIndex) return;
	var specSrc = storage[image].specs[specFrom];
	var specDst = storage[image].specs[storage[image].columns[storage[image].colIndex].spec];
	specDst.splice(0, specDst.length);
	for (var i = 0; i < specSrc.length; i++)
		specDst.push({pos: specSrc[i].pos, idx: specSrc[i].idx});
	editorUpdateSpec();
	editorUpdateCanvas();
	updateBox(image);
}

/**
 *	Row selection changed.
 */
function editorSelect(e) {
	var idx = e.currentTarget.value;
	if (idx === "") {
		e.currentTarget.value = String(rowSel);
		return;
	}
	editorUpdateRow(Number.parseInt(idx));
}

/**
 *	Row split button clicked.
 */
function editorRowInsert(e) {
	const specIdx = storage[image].columns[storage[image].colIndex].spec;
	const spec = storage[image].specs[specIdx];
	//	Can't split if too thin
	var y1 = 0, y2 = 256;
	if (rowSel >= 1)
		y1 = spec[rowSel - 1].pos;
	if (spec[rowSel].pos > 0 && spec[rowSel].pos < 256)
		y2 = spec[rowSel].pos;
	if (y2 - y1 <= 1)
		return;
	spec.splice(rowSel, 0, {pos: spec[rowSel].pos, idx: spec[rowSel].idx});
	spec[rowSel].pos = Math.floor((y1 + y2) / 2);
	editorUpdateSpec();
	editorUpdateCanvas();
}

/**
 *	Row delete button clicked.
 */
function editorRowDelete(e) {
	const specIdx = storage[image].columns[storage[image].colIndex].spec;
	const spec = storage[image].specs[specIdx];
	if (spec.length <= 1) return;
	spec.splice(rowSel, 1);
	if (rowSel >= spec.length) {
		rowSel = spec.length - 1;
		spec[rowSel].pos = 0;
	}
	editorUpdateSpec();
	editorUpdateCanvas();
}

/**
 *	Row position number changed.
 */
function editorRowPosition(e) {
	const specIdx = storage[image].columns[storage[image].colIndex].spec;
	const spec = storage[image].specs[specIdx];
	var p = e.currentTarget.value;
	if (p == "") {
		e.currentTarget.value = spec[rowSel].pos;
		return;
	}
	var max = 255, min = 1;
	if (rowSel < spec.length - 2)
		max = spec[rowSel + 1].pos - 1;
	if (rowSel >= 1)
		min = spec[rowSel - 1].pos + 1;
	p = Math.max(Math.min(max, p), min);
	if (rowSel == spec.length - 1)
		p = 0;
	spec[rowSel].pos = p;
	e.currentTarget.value = p;
	editorUpdateSpecRow(rowSel);
	editorUpdateCanvas();
	updateBox(image);
	editorSetHCursors((rowSel != spec.length - 1), min - 1, p, max + 1);
}

/**
 *	Row index number changed.
 */
function editorRowColor(e) {
	const specIdx = storage[image].columns[storage[image].colIndex].spec;
	const spec = storage[image].specs[specIdx];
	var idx = e.currentTarget.value;
	if (idx === "") {
		e.currentTarget.value = spec[rowSel].idx;
		return;
	}
	idx = Math.max(Math.min(storage[image].palMax - 1, idx), 0);
	spec[rowSel].idx = idx;
	e.currentTarget.value = idx;
	editorUpdateSpecRow(rowSel);
	editorUpdateCanvas();
	updateBox(image);
}

/**
 *	Mouse actions in the edit window.
 */
function editorMousedown(e) {
	var rect = document.getElementById(COLUMN_IDS[3]).getBoundingClientRect();
	var xImg = Math.floor((e.clientX - Math.round(rect.left) - EDITOR_MARGINS.left) * 256 / EDITOR_IMAGE.width);
	var yImg = Math.floor((e.clientY - Math.round(rect.top) - EDITOR_MARGINS.top) * 256 / EDITOR_IMAGE.height);
	//console.log("type: " + e.type + ", target: " + e.target.id
	//		+ ", x: " + String(e.clientX - Math.round(rect.left))
	//		+ ", y: " + String(e.clientY - Math.round(rect.top)));
	if (e.type == "mousedown") {
		//	Begin click/drag, log origin and target
		e.preventDefault();
		mouseClick.xStart = e.clientX - Math.round(rect.left);
		mouseClick.yStart = e.clientY - Math.round(rect.top);
		mouseClick.down = true;
		mouseClick.shift = e.shiftKey;
		mouseClick.target = e.target.id;
		
		if (e.shiftKey && e.target.id == CURSOR_IDS[11]) {
			//	begin multi-drag operation; search image for targets
			mouseClick.multiRows = [];
			var specIdx = storage[image].columns[storage[image].colIndex].spec;
			var spec = storage[image].specs[specIdx];
			var p = spec[rowSel].pos;
			for (var col = 0; col < storage[image].colMax; col++) {
				var specIdx = storage[image].columns[col].spec;
				var spec = storage[image].specs[specIdx];
				for (var row = 0; row < spec.length && spec[row].pos < p; row++);
				if (row < spec.length && spec[row].pos == p)
					mouseClick.multiRows.push({spec: specIdx, row: row});
			}
		}

	} else if (e.type == "mouseup" && mouseClick.down) {	//	Note, receives from any source
		mouseClick.down = false;
		if (e.target.id == mouseClick.target) {
			//	click started and ended in same object; possible editclick{top|left|bot} selection

			//	top, select column
			if (mouseClick.target == CURSOR_IDS[0]) {
				xImg = Math.min(256, Math.max(0, xImg));
				var col = 0;
				for (; col < storage[image].colMax - 1 && storage[image].columns[col].pos - 1 < xImg; col++);
					editorChangeColumn(col);
					editorUpdateCanvas();

			//	left, select row
			} else if (mouseClick.target == CURSOR_IDS[1]) {
				yImg = Math.min(256, Math.max(0, yImg));
				const specIdx = storage[image].columns[storage[image].colIndex].spec;
				const spec = storage[image].specs[specIdx];
				var row = 0;
				for (; row < spec.length - 1 && spec[row].pos - 1 < yImg; row++);
				editorUpdateRow(row);

			//	bottom, select clone column
			} else if (mouseClick.target == CURSOR_IDS[2] || mouseClick.target == CURSOR_IDS[12]) {
				xImg = Math.min(256, Math.max(0, xImg));
				var col = 0;
				for (; col < storage[image].colMax - 1 && storage[image].columns[col].pos - 1 < xImg; col++);
				specFrom = col;
				editorSetSpecCursor(col);
			}
		}
	}

	//	Check for click and drag within image area
	if (mouseClick.down && mouseClick.xStart > EDITOR_MARGINS.left
			&& mouseClick.yStart > EDITOR_MARGINS.top
			&& mouseClick.xStart <= EDITOR_MARGINS.left + EDITOR_IMAGE.width
			&& mouseClick.yStart <= EDITOR_MARGINS.top + EDITOR_IMAGE.height) {

		if (xImg >= 0 && yImg >= 0 && xImg <= 256 && yImg <= 256) {
			//	Find image pixel
			var col = 0;
			for (; col < storage[image].colMax - 1 && storage[image].columns[col].pos < xImg; col++);
			const specIdx = storage[image].columns[col].spec;
			const spec = storage[image].specs[specIdx];
			var row = 0;
			for (; row < spec.length - 1 && spec[row].pos < yImg; row++);
			if (mouseClick.shift) {
				//	Pick color from image
				if (storage[image].palIndex != spec[row].idx)
					paletteSetIndex(spec[row].idx);
			} else {
				//	Paint with selected color
				if (spec[row].idx != storage[image].palIndex) {
					spec[row].idx = storage[image].palIndex;
					if (row == rowSel)
						document.getElementById(COLUMN_IDS[13]).value = storage[image].palIndex;
					if (col == storage[image].colIndex)
						editorUpdateSpecRow(row);
					editorUpdateCanvas();
					updateBox(image);
				}
			}
		}

	//	Vertical cursor drag
	} else if (mouseClick.down && mouseClick.target == CURSOR_IDS[10]) {
		if (xImg >= 0 && xImg <= 256) {
			var el = document.getElementById(COLUMN_IDS[2]);
			el.value = xImg;
			editorPosition({ currentTarget: el });
		}

	//	Horizontal cursor drag
	} else if (mouseClick.down && mouseClick.target == CURSOR_IDS[11]) {
		if (yImg >= 0 && yImg <= 256) {
			if (mouseClick.shift) {
				for (var i = 0; i < mouseClick.multiRows.length; i++) {
					var spec = storage[image].specs[mouseClick.multiRows[i].spec];
					var p = yImg;
					var max = 255, min = 1;
					if (mouseClick.multiRows[i].row < spec.length - 2)
						max = spec[mouseClick.multiRows[i].row + 1].pos - 1;
					if (mouseClick.multiRows[i].row >= 1)
						min = spec[mouseClick.multiRows[i].row - 1].pos + 1;
					p = Math.max(Math.min(max, p), min);
					if (rowSel == spec.length - 1)
						p = 0;
					spec[mouseClick.multiRows[i].row].pos = p;
				}
			}
			var el = document.getElementById(COLUMN_IDS[12]);
			el.value = yImg;
			editorRowPosition({ currentTarget: el });
		}
	}

}
//	CURSOR_IDS      []
//	"editclicktop"   0	click target, column select
//	"editclickleft"  1	click target, row select
//	"editclickbot"   2	click target, spec copy select
//	"editcurv1"      3	vertical cursor, end of previous column or 0
//	"editcurv2"      4	vertical cursor, end of selected column
//	"editcurv3"      5	vertical cursor, end of next column or 256
//	"editcurh1"      6	horizontal cursor, end of previous row or 0
//	"editcurh2"      7	horizontal cursor, end of selected row
//	"editcurh3"      8	horizontal cursor, end of next row or 256
//	"editspeccur1"   9	cursor, column/spec selected to copy from (top half)
//	"editcurv2c"    10	vertical cursor, end of selected column control box
//	"editcurh2c"    11	horizontal cursor, end of selected row control box
//	"editspeccur2"  12	cursor, column/spec selected to copy from (bottom half)

//	COLUMN_IDS  []	func
//	"coltotal"   0	(output field)
//	"colsel"     1	editorIndex
//	"colpos"     2	editorPosition
//	"editbox"    3	editorMousedown
//	"colins"     4	editorCopy
//	"coldel"     5	editorDelete
//	"fromcol"    6	editorFrom
//	"specclone"  7	editorSpecClone
//	"rowsel"     8	editorSelect
//	"rowins"     9	editorRowInsert
//	"rowdel"    10	editorRowDelete
//	"rownum"    11	(output field)
//	"rowpos"    12	editorRowPosition
//	"rowidx"    13	editorRowColor
//	"editor"    14	(output canvas)
//	"specnum"   15	(output field)

/**
 *	Updates the editor canvas with the given color index
 *	(e.g. because its attribute has changed).
 */
function editorUpdateIndex(idx) {
	editorUpdateCanvas();
}

/**
 *	Updates the "col" select list controls.
 */
function editorUpdateCol(ci) {
	var s = "<option disabled=\"true\" style=\"text-decoration: underline;\">col: pos</option>";
	for (var i = 0; i < storage[image].colMax; i++) {
		var subst = ("   " + String(i)).slice(-3)
			+ ":" + ("    " + String(storage[image].columns[i].pos)).slice(-4)
		subst = subst.replace(/ /g, "&nbsp;");
		s += "<option value=\"" + String(i) + "\">" + subst + "</option>";
	}
	var e = document.getElementById(COLUMN_IDS[1]);
	e.innerHTML = s;
	ci = Math.min(Math.max(ci, 0), storage[image].colMax - 1);
	storage[image].colIndex = ci;
	e.value = String(ci);
	document.getElementById(COLUMN_IDS[5]).disabled = (storage[image].colMax <= 1);	//	"coldel"
}

/**
 *	Selects the specified column in the editor view and updates vertical cursors.
 */
function editorChangeColumn(idx) {
	idx = Math.min(Math.max(idx, 0), storage[image].colMax - 1);
	storage[image].colIndex = idx;
	document.getElementById(COLUMN_IDS[1]).value = String(idx);
	editorUpdateSpec();
	var e = document.getElementById(COLUMN_IDS[2]);
	if (idx < storage[image].colMax - 1) {
		e.disabled = false;
		e.value = storage[image].columns[idx].pos;
		var min = 1, max = 255;
		if (idx < storage[image].colMax - 2)
			max = storage[image].columns[idx + 1].pos - 1;
		if (idx >= 1)
			min = storage[image].columns[idx - 1].pos + 1;
		e.min = min; e.max = max;
		editorSetVCursors(true, min - 1, storage[image].columns[idx].pos, max + 1);
	} else {
		e.disabled = true;	//	special case, final column has pos = 0, cannot adjust
		e.value = 0; e.max = 0; e.min = 0;
		editorSetVCursors(false, (idx > 0) ? storage[image].columns[idx - 1].pos : 0, 255, 256);
	}
	//	Check if clone button should be disabled
	const ci = storage[image].colIndex;
	var p = storage[image].columns[ci].pos, min = 0;
	if (p <= 0 || p > 256) p = 256;
	if (ci >= 1) min = storage[image].columns[ci - 1].pos;
	document.getElementById(COLUMN_IDS[4]).disabled = (p - min <= 1);	//	"colins"
}

/**
 *	Updates the "spec" select list controls.
 */
function editorUpdateSpec() {
	const specIdx = storage[image].columns[storage[image].colIndex].spec;
	const spec = storage[image].specs[specIdx];
	var s = "<option disabled=\"true\" style=\"text-decoration: underline;\">row pos idx</option>";
	for (var i = 0; i < spec.length; i++) {
		var subst = ("   " + String(i)).slice(-3)
			+ ("    " + String(spec[i].pos)).slice(-4)
			+ ("    " + String(spec[i].idx)).slice(-4);
		subst = subst.replace(/ /g, "&nbsp;");
		s += "<option value=\"" + String(i) + "\">" + subst + "</option>";
		
	}
	document.getElementById(COLUMN_IDS[8]).innerHTML = s;
	document.getElementById(COLUMN_IDS[15]).innerHTML = String(specIdx);
	editorUpdateRow(rowSel);
	document.getElementById(COLUMN_IDS[10]).disabled = (spec.length <= 1);	//	"rowdel"
}

/**
 *	Update a specific row in the "spec" select list control.
 */
function editorUpdateSpecRow(row) {
	const specIdx = storage[image].columns[storage[image].colIndex].spec;
	const spec = storage[image].specs[specIdx];
	var s =   ( "   " + String(row)).slice(-3)
			+ ("    " + String(spec[row].pos)).slice(-4)
			+ ("    " + String(spec[row].idx)).slice(-4);
	s = s.replace(/ /g, "&nbsp;");
	document.getElementById(COLUMN_IDS[8]).childNodes[row + 1].innerHTML = s;
}

/**
 *	Updates the row controls and horizontal cursors based on the specified index.
 */
function editorUpdateRow(idx) {
	const specIdx = storage[image].columns[storage[image].colIndex].spec;
	const spec = storage[image].specs[specIdx];
	rowSel = Math.min(Math.max(idx, 0), spec.length - 1);
	document.getElementById(COLUMN_IDS[8]).value = String(rowSel);	//	"rowsel"
	document.getElementById(COLUMN_IDS[11]).innerHTML = String(rowSel);	//	"rownum"
	var e = document.getElementById(COLUMN_IDS[12]);	//	"rowpos"
	if (rowSel < spec.length - 1) {
		e.disabled = false;
		e.value = spec[rowSel].pos;
		var min = 1, max = 255;
		if (rowSel < spec.length - 2)
			max = spec[rowSel + 1].pos - 1;
		if (rowSel >= 1)
			min = spec[rowSel - 1].pos + 1;
		e.min = min; e.max = max;
		editorSetHCursors(true, min - 1, spec[rowSel].pos, max + 1);
	} else {
		e.disabled = true;	//	special case, final row has pos = 0, cannot adjust
		e.value = 0; e.max = 0; e.min = 0;
		editorSetHCursors(false, (rowSel > 0) ? spec[rowSel - 1].pos : 0, 255, 256);
	}
	document.getElementById(COLUMN_IDS[13]).value = spec[rowSel].idx;	//	"rowidx"
	//	Disable split button if too thin
	var p = spec[rowSel].pos, min = 0;
	if (p <= 0 || p > 256) p = 256;
	if (rowSel >= 1) min = spec[rowSel - 1].pos;
	document.getElementById(COLUMN_IDS[9]).disabled = (p - min <= 1);	//	"rowins"

}

/**
 *	Sets the vertical cursors.
 */
function editorSetVCursors(en, min, val, max) {
	document.getElementById(CURSOR_IDS[3]).style.left = String(min * EDITOR_IMAGE.height / 256 + EDITOR_MARGINS.left - 1) + "px";	//	"editcurv1"
	var e = document.getElementById(CURSOR_IDS[4]);
	e.style.visibility = (en) ? "visible" : "hidden";
	e.style.left = String(val * EDITOR_IMAGE.height / 256 + EDITOR_MARGINS.left - 1) + "px";	//	"editcurv2"
	var e = document.getElementById(CURSOR_IDS[10]);
	e.style.visibility = (en) ? "visible" : "hidden";
	e.style.left = String(val * EDITOR_IMAGE.height / 256 + EDITOR_MARGINS.left - 5) + "px";	//	"editcurv2c"
	document.getElementById(CURSOR_IDS[5]).style.left = String(max * EDITOR_IMAGE.height / 256 + EDITOR_MARGINS.left - 1) + "px";	//	"editcurv3"
}

/**
 *	Sets the horizontal cursors.
 */
function editorSetHCursors(en, min, val, max) {
	document.getElementById(CURSOR_IDS[6]).style.top = String(min * EDITOR_IMAGE.width / 256 + EDITOR_MARGINS.top - 1) + "px";	//	"editcurh1"
	var e = document.getElementById(CURSOR_IDS[7]);
	e.style.visibility = (en) ? "visible" : "hidden";
	e.style.top = String(val * EDITOR_IMAGE.width / 256 + EDITOR_MARGINS.top - 1) + "px";	//	"editcurh2"
	e = document.getElementById(CURSOR_IDS[11]);
	e.style.visibility = (en) ? "visible" : "hidden";
	e.style.top = String(val * EDITOR_IMAGE.width / 256 + EDITOR_MARGINS.top - 5) + "px";	//	"editcurh2c"
	document.getElementById(CURSOR_IDS[8]).style.top = String(max * EDITOR_IMAGE.width / 256 + EDITOR_MARGINS.top - 1) + "px";	//	"editcurh3"
}

/**
 *	Sets the spec-from cursor.
 */
function editorSetSpecCursor(idx) {
	var x1 = 0, x2 = 256;
	if (idx > 0) x1 = storage[image].columns[idx - 1].pos;
	if (idx < storage[image].colMax - 1) x2 = storage[image].columns[idx].pos;
	document.getElementById(CURSOR_IDS[9]).style.left = String((x1 + x2) * EDITOR_IMAGE.width / 512 + EDITOR_MARGINS.left - 8) + "px";	//	"editspeccur1"
	document.getElementById(CURSOR_IDS[12]).style.left = String((x1 + x2) * EDITOR_IMAGE.width / 512 + EDITOR_MARGINS.left - 8) + "px";	//	"editspeccur2"
	document.getElementById(COLUMN_IDS[6]).value = specFrom;	//	"specclone"
}

/**
 *	Updates the editor canvas.
 */
function editorUpdateCanvas() {
	const ctx = document.getElementById(COLUMN_IDS[14]).getContext("2d");
	//ctx.putImageData(drawImage(storage[image], EDITOR_IMAGE.width, EDITOR_IMAGE.height),
	//		EDITOR_MARGINS.left, EDITOR_MARGINS.top);
	drawImageCtx(ctx, storage[image], EDITOR_MARGINS.left, EDITOR_MARGINS.top,
			EDITOR_IMAGE.width, EDITOR_IMAGE.height);
	ctx.clearRect(EDITOR_MARGINS.left, EDITOR_MARGINS.top - EDITOR_TICKMARK,
			EDITOR_IMAGE.width, EDITOR_TICKMARK);
	ctx.clearRect(EDITOR_MARGINS.left - EDITOR_TICKMARK, EDITOR_MARGINS.top,
			EDITOR_TICKMARK, EDITOR_IMAGE.height);
	ctx.clearRect(EDITOR_MARGINS.left, EDITOR_MARGINS.top + EDITOR_IMAGE.height,
			EDITOR_IMAGE.width, EDITOR_TICKMARK);
	ctx.clearRect(EDITOR_MARGINS.left + EDITOR_IMAGE.width, EDITOR_MARGINS.top,
			EDITOR_TICKMARK, EDITOR_IMAGE.height);
	ctx.beginPath();
	ctx.strokeStyle = EDITOR_TICKCOLOR; ctx.lineWidth = 1;
	ctx.moveTo(EDITOR_MARGINS.left - 0.5, EDITOR_MARGINS.top - EDITOR_TICKMARK);
	ctx.lineTo(EDITOR_MARGINS.left - 0.5, EDITOR_MARGINS.top);
	ctx.moveTo(EDITOR_MARGINS.left - 0.5, EDITOR_MARGINS.top + EDITOR_IMAGE.height);
	ctx.lineTo(EDITOR_MARGINS.left - 0.5, EDITOR_MARGINS.top + EDITOR_IMAGE.height + EDITOR_TICKMARK);
	for (var i = 0; i < storage[image].colMax; i++) {
		var x = storage[image].columns[i].pos;
		if (x == 0) x = 256;
		x *= EDITOR_IMAGE.width / 256;
		ctx.moveTo(EDITOR_MARGINS.left + x - 0.5, EDITOR_MARGINS.top + EDITOR_IMAGE.height);
		ctx.lineTo(EDITOR_MARGINS.left + x - 0.5, EDITOR_MARGINS.top + EDITOR_IMAGE.height + EDITOR_TICKMARK);
		ctx.moveTo(EDITOR_MARGINS.left + x - 0.5, EDITOR_MARGINS.top - EDITOR_TICKMARK);
		ctx.lineTo(EDITOR_MARGINS.left + x - 0.5, EDITOR_MARGINS.top);
	}
//	ctx.stroke(); ctx.beginPath();
	ctx.moveTo(EDITOR_MARGINS.left - EDITOR_TICKMARK, EDITOR_MARGINS.top - 0.5);
	ctx.lineTo(EDITOR_MARGINS.left, EDITOR_MARGINS.top - 0.5);
	ctx.moveTo(EDITOR_MARGINS.left + EDITOR_IMAGE.width, EDITOR_MARGINS.top - 0.5);
	ctx.lineTo(EDITOR_MARGINS.left + EDITOR_IMAGE.width + EDITOR_TICKMARK, EDITOR_MARGINS.top - 0.5);
	const spec = storage[image].specs[storage[image].columns[storage[image].colIndex].spec];
	for (var i = 0; i < spec.length; i++) {
		var y = spec[i].pos;
		if (y == 0) y = 256;
		y *= EDITOR_IMAGE.height / 256;
		ctx.moveTo(EDITOR_MARGINS.left - EDITOR_TICKMARK, EDITOR_MARGINS.top + y - 0.5);
		ctx.lineTo(EDITOR_MARGINS.left, EDITOR_MARGINS.top + y - 0.5);
		ctx.moveTo(EDITOR_MARGINS.left + EDITOR_IMAGE.width, EDITOR_MARGINS.top + y - 0.5);
		ctx.lineTo(EDITOR_MARGINS.left + EDITOR_IMAGE.width + EDITOR_TICKMARK, EDITOR_MARGINS.top + y - 0.5);
	}
	ctx.strokeStyle = EDITOR_TICKCOLOR; ctx.lineWidth = 1; ctx.stroke();
}

/* * * Support Functions * * */

/**
 *	Constructs an empty (simplest blank) image structure.
 *	If passed an argument, makes a minimal, de-optimized copy of it.
 *	Note: palIndex, palMax and colMax are helper parameters used by the editor;
 *	they are not part of the file format and are initialized on loading.
 */
function newImage(im) {
	if (arguments.length == 0)
		return {
			name: "",
			palette: [
				"#ffffff",
				"#000000"
			],
			palIndex: 0,
			palMax: 2,
			columns: [
				{ pos: 0, spec: 0 }
			],
			colIndex: 0,
			colMax: 1,
			specs: [
				[	//	colspec 0
					{ pos: 0, idx: 0 }
				]
			],
		};

	//	Else, make a copy
	var copy = {
		name: "",
		palette: [],
		palIndex: 0,
		palMax: 2,
		columns: [],
		colIndex: 0,
		colMax: 1,
		specs: [],
	}
	copy.name = String(im.name);
	//	Copy palette
	if (!im.hasOwnProperty("palMax")) im.palMax = im.palette.length;
	im.palMax = Math.min(im.palMax, im.palette.length, PALETTE_CAPACITY);
	if (im.palMax < 2) throw new TypeError("Insufficient palette entries in source: < 2");
	for (var i = 0; i < im.palMax; i++) {
		var c = String(im.palette[i]);
		if (!/^#(?:[0-9a-fA-F]{6})$/.test(c))
			throw new TypeError("Invalid palette entry `" + String(c) + "' at index " + String(i));
		copy.palette.push(c);
	}
	copy.palMax = copy.palette.length;
	//	Copy columns; de-duplicate and trivial-order colspecs to avoid dealing
	//	with optimized images in the editor
	if (!im.hasOwnProperty("colMax")) im.colMax = im.columns.length;
	im.colMax = Math.min(im.colMax, im.columns.length, 256);
	if (im.colMax < 1) throw new TypeError("Insufficient column entries in source: < 1");
	for (var i = 0; i < im.colMax; i++) {
		var p = Number.parseInt(im.columns[i].pos);
		if (isNaN(p) || (i > 0 && p != 0 && p <= copy.columns[i - 1].pos))
			throw new TypeError("Column " + String(i) + ", invalid position: " + String(p));
		copy.columns.push({pos: p, spec: i});
		var colspec = [];
		for (var j = 0; j < im.specs[im.columns[i].spec].length; j++) {
			var yp = Number.parseInt(im.specs[im.columns[i].spec][j].pos);
			var id = Number.parseInt(im.specs[im.columns[i].spec][j].idx);
			if (isNaN(id) || id < 0 || id >= copy.palette.length)
				throw new TypeError("Column " + String(i) + ", spec " + String(im.columns[i].spec) + ", entry " + String(j) + ": invalid palette index " + String(id));
			if (isNaN(yp) || (j > 0 && yp != 0 && yp <= colspec[j - 1].pos))
				throw new TypeError("Column " + String(i) + ", spec " + String(im.columns[i].spec) + ", entry " + String(j) + ": invalid position: " + String(yp));
			colspec.push({pos: yp, idx: id});
			if (yp == 0) break;
		}
		copy.specs.push(colspec);
		if (p == 0) break;
	}
	copy.colMax = copy.columns.length;

	return copy;
}

/**
 *	Coalesces rows in the provided colspec: a row is
 *	deleted if it matches the idx of the element below it.
 */
function coalesceRows(spec) {
	var i = 0;
	while (i < spec.length - 1) {
		if (spec[i].idx == spec[i + 1].idx) {
			spec.splice(i, 1);
		} else {
			i++;
		}
	}
}

/**
 *	Coalesces rows and columns in the provided image: a row is
 *	deleted if it matches the idx of the element below it,
 *	and a column is deleted if its spec matches the column right
 *	of it. Unused columns and specs are also removed.
 */
function coalesceImage(im) {
	var i = 0;
	im.columns.splice(im.colMax);
	for (var i = 0; i < im.specs.length; i++) {
		coalesceRows(im.specs[i]);
	}
	//	Speed up identification with hashing
	var specHashes = [];
	for (var i = 0; i < im.specs.length; i++) {
		specHashes.push(hashSpec(im.specs[i]));
	}
	i = 0;
	while (i < im.columns.length - 1) {
		if (specHashes[im.columns[i].spec] == specHashes[im.columns[i + 1].spec]) {
			//	possible duplicate, check for hash collision to be sure
			var match = true;
			var cmp1 = im.specs[im.columns[i].spec], cmp2 = im.specs[im.columns[i + 1].spec];
			for (var j = 0; j < cmp1.length && match; j++)
				match &&= (cmp1.pos == cmp2.pos) && (cmp1.idx == cmp2.idx);
			if (match)
				im.columns.splice(i, 1);
			else
				i++;
		} else
			i++;
	}
	im.colMax = im.columns.length;
}

/**
 *	Simple string hash function.
 */
function hashCode(str) {
	var hash = 0;
	hash = (hash << 5) - hash + str.length; hash |= 0;
	for (var i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;	//	convert sum to 32-bit integer
	}
	return hash;
}

/**
 *	Computes hash of the given spec array.
 */
function hashSpec(spec) {
	var hash = spec.length | 0;
	for (let i = 0; i < spec.length; i++) {
		hash = (hash << 5) - hash + spec[i].pos; hash |= 0;
		hash = (hash << 5) - hash + spec[i].idx; hash |= 0;
	}
	return hash;
}

/**
 *	Makes:
 *	<div class="storbox" id="storbox${idx}">
 *		<div id="storboxnum${idx}">${idx}</div>
 *		<div id="storboxname${idx}">${name}</div>
 *		<canvas id="storboximg${idx}" width="${STOREBOX_IMG_WIDTH}"
 *				height="${STOREBOX_IMG_HEIGHT}"></canvas>
 *	</div>
 *	with the appropriate insertions, and converting img into canvas contents.
 */
function newBox(idx, name, img) {

	//	...Probably easier to just let the browser parse raw HTML, really,
	//	but we can do it by objects and that's fun I guess?
	var e = document.createElement("div");
	e.setAttribute("class", STOREBOX_CLASS);
	e.setAttribute("id", STOREBOX_ID_BASE[0] + String(idx));	//	outer "box" with border
	var c = document.createElement("div");
	c.setAttribute("id", STOREBOX_ID_BASE[1] + String(idx));	//	number label
	c.innerHTML = String(idx);
	e.appendChild(c);
	c = document.createElement("div");
	c.setAttribute("id", STOREBOX_ID_BASE[2] + String(idx));	//	name
	name = String(name).trim().substring(0, 24) || "blank";
	c.appendChild(document.createTextNode(name));
	e.appendChild(c);
	c = document.createElement("canvas");
	c.setAttribute("id", STOREBOX_ID_BASE[3] + String(idx));	//	image
	c.setAttribute("width", String(STOREBOX_IMG_WIDTH));
	c.setAttribute("height", String(STOREBOX_IMG_HEIGHT));
	drawImageCtx(c.getContext("2d"), img, 0, 0, STOREBOX_IMG_WIDTH, STOREBOX_IMG_HEIGHT);
	e.appendChild(c);

	return e;
}

/**
 *	Updates the indexed storage slot's background image.
 */
function updateBox(idx, draw = 0) {
	var c = document.getElementById(STOREBOX_ID_BASE[3] + String(idx));	//	image
	if (c === null) return;
	drawImageCtx(c.getContext("2d"), storage[idx], 0, 0, c.width, c.height);
}

/**
 *	Makes:
 *	<div class="palswatch" id="palsw${idx}" style="background-color: ${color};"></div>
 *	with event listener.
 */
function newSwatch(idx, color) {

	var e = document.createElement("div");
	e.setAttribute("class", PALETTE_CLASS);
	e.setAttribute("id", PALETTE_ID_BASE + String(idx));
	e.setAttribute("style", "background-color: " + color + ";");
	e.addEventListener("click", paletteSelect, true);

	return e;
}

/**
 *	Disposes of the "palsw${idx}" element, removing it from palswatches and
 *	removing the event listener.
 *	Returns true on success, false if element not found.
 */
function removeSwatch(idx) {
	var e = document.getElementById(PALETTE_ID_BASE + String(idx));
	if (e === null) return false;
	e.removeEventListener("click", paletteSelect, true);
	e.remove();
	return true;
}

/**
 *	Renders the specified image to an image object of specified size (or 256 x 256 default).
 */
function drawImage(img, width = 256, height = 256) {

	//	Make fast array copy (JIT can better optimize loop?)
	var colPos = [], specOffs = [], specsPos = [], specsColor = [], running = 0;
	for (var i = 0; i < img.colMax; i++) {
		colPos.push(Number(img.columns[i].pos));
		var s = Number(img.specs[img.columns[i].spec].length);
		specOffs.push(running); running += s;
		for (var j = 0, l = img.specs[img.columns[i].spec].length; j < l; j++) {
			const pos = img.specs[img.columns[i].spec][j].pos;
			//if (pos == 0) pos = 256;
			specsPos.push(pos);
			specsColor.push(Number.parseInt(img.palette[
					img.specs[img.columns[i].spec][j].idx
				].substring(1, 7), 16));
		}
	}
	specOffs.push(specsPos.length);

	var a = new ImageData(width, height), c = 0, offs = 0;
	const d = a.data;
	for (var x = 0; x < width; x++) {
		//	0 (mod 256) means end of columns list (sentinel), or overflow; and don't run out of bounds
		while (colPos[c] > 0 && colPos[c] < 256 && c < colPos.length && (x * 256 / width) >= colPos[c]) {
			c++;
		}
		offs = specOffs[c];
		for (var y = 0; y < height; y++) {
			//	0 (mod 256) means end of rows (sentinel) or overflow
			while (specsPos[offs] > 0 && specsPos[offs] < 256 && offs < specOffs[c + 1] && (y * 256 / height) >= specsPos[offs]) {
				offs++;
			}
			var clr = specsColor[offs];
			var p = (x + y * width) * 4;
			d[p + 0] = (clr >> 16) & 0xff;
			d[p + 1] = (clr >>  8) & 0xff;
			d[p + 2] = (clr >>  0) & 0xff;
			d[p + 3] = 0xff;
		}
	}

	return a;
}

/**
 *	Renders the specified image to an image object of specified size (or 256 x 256 default).
 *	Reference implementation: slow but methodical, byte oriented.
 */
function drawImageRef(img, width = 256, height = 256) {

	var a = new ImageData(width, height);
	var c = 0; /**< column index */
	var r = 0; /**< row index */
	var spec = img.specs[img.columns[c].spec];
	var color = Number.parseInt(img.palette[spec[r].idx].substring(1, 7), 16);
	var idx;
	for (var x = 0; x < width; x++) {
		//	0 (mod 256) means end of columns list (sentinel), or overflow; and don't run out of bounds
		while (img.columns[c].pos > 0 && img.columns[c].pos < 256 && c < img.colMax && (x * 256 / width) >= img.columns[c].pos) {
			c++;
			spec = img.specs[img.columns[c].spec];
		}
		r = 0;
		idx = Math.min(Math.max(spec[r].idx, 0), img.palette.length - 1);	//	opportunity: treat out-of-bounds idx as transparent color
		color = Number.parseInt(img.palette[idx].substring(1, 7), 16);
		for (var y = 0; y < height; y++) {
			//	0 (mod 256) means end of rows (sentinel) or overflow
			while (spec[r].pos > 0 && spec[r].pos < 256 && r < spec.length && (y * 256 / height) >= spec[r].pos) {
				r++;
				idx = Math.min(Math.max(spec[r].idx, 0), img.palette.length - 1);
				color = Number.parseInt(img.palette[idx].substring(1, 7), 16);
			}
			a.data[(x + y * width) * 4 + 0] = (color >> 16) & 0xff;
			a.data[(x + y * width) * 4 + 1] = (color >>  8) & 0xff;
			a.data[(x + y * width) * 4 + 2] = (color >>  0) & 0xff;
			a.data[(x + y * width) * 4 + 3] = 0xff;
		}
	}

	return a;
}

/**
 *	Renders the specified image to the provided CanvasRenderingContext2D context,
 *	at coordinates and dimensions specified.
 */
function drawImageCtx(ctx, img, xOffs = 0, yOffs = 0, width = 256, height = 256) {
	var x1 = 0, x2;
	for (var c = 0; c < img.colMax; c++) {
		if (img.columns[c].pos == 0 || img.columns[c].pos >= 256)
			x2 = width;
		else
			x2 = Math.ceil(img.columns[c].pos * width / 256);
		if (x2 > x1) {
			var spec = img.specs[img.columns[c].spec];
			var y1 = 0, y2;
			for (var r = 0; r < spec.length; r++) {
				if (spec[r].pos == 0 || spec[r].pos >= 256)
					y2 = height;
				else
					y2 = Math.ceil(spec[r].pos * height / 256);
				if (y2 > y1) {
					ctx.fillStyle = img.palette[spec[r].idx];
					ctx.fillRect(xOffs + x1, yOffs + y1, x2 - x1, y2 - y1);
				}
				y1 = y2;
			}
		}
		x1 = x2;
	}
}

/**
 *	Formatters: functions to convert internal image structure between various representations.
 *	Enumerate with Object.keys, or use as associative array indexed by values of radio buttons.
 *	(See initialization for how radio buttons are configured.)
 *
 *	Execution context:
 *		ImageData im = FORMATTERS["${format}"].load(ArrayData a);
 *		{asc, url} = FORMATTERS["${format}"].save(ImageData im);
 *	The source data (a) is delivered in a Uint8Array-able format, regardless of
 *	ASCII or binary source.  (When ASCII, a trivial TextEncode-ing is applied.)
 *
 *	load returns an image structured as the return value from newImage() (i.e.
 *	using this return value as a pseudoclass ImageData); the optional parameters
 *	will be ignored and can be omitted here.
 *	If load throws an error, the return value is ignored and the error type/
 *	description is placed in the messagebox.
 *
 *	save returns an object pair: asc is a string, the ASCII/Unicode text format; or
 *	for binary formats, a human-readable description of the data (e.g. type, length,
 *	and other statistics).  url is a URI-encoded version of the enclosed binary data.
 *	For ASCII formats, this is simply the verbatim content URLified (type: text/
 *	plain).  For binary formats, it is the data array (type: application/octet-
 *	stream), or any other format as applicable (e.g. image/png).
 *	asc is displayed in the <textarea> for viewing/copying or for reference, and url
 *	is available on the Download button.
 *
 *	load and save can alternately return a Promise, when deferred processing is
 *	required (e.g. browser parsing an image URL, large JSON, etc.).
 *
 *	supportsAscii is a flag to indicate whether one should try to parse text with
 *	the loader (i.e. feed <textarea> contents to it).
 *
 *	label is a text label to put on the respective radio button.
 *
 *	Ideally, load(save(im)) (using the appropriate output parameter and decoding
 *	from save) is idempotent, i.e. the input is unchanged, at least to a graphical
 *	level (palette order and specs may differ).  When scaling occurs, a one-pixel
 *	error is acceptable, so long as it isn't cumulative (i.e. load(save(load(
 *	save(im))))... is stable or a limit cycle).
 */
const FORMATTERS = {
	crl: {
		label: "CRL",
		supportsAscii: false,
		extension: ".crl",
		load: function(a) {	//	a instanceof ArrayData
			var arr = new Uint8Array(a);

			//	Insert or breakpoint and execute here to extract palette from 256-color bitmap of typical header version
			//	var pal = bmpPalExtract(arr, 256);
			function bmpPalExtract(a, count) {
				var pal = [];
				for (var i = 54; i < (54 + 4 * count); i += 4) {
					pal.push(
						"#" + (
							"00000" + (
								a[i] + a[i + 1] * 256 + a[i + 2] * 65536
							).toString(16)
						).slice(-6)
					);
				}
				return pal;
			}

			var im = {
				name: "",
				palette: [],
				palIndex: 0,
				palMax: 2,
				columns: [],
				colIndex: 0,
				colMax: 1,
				specs: [],
			};
			var b = 0;
			var version = arr[b++];
			//	only versions 1 and 2 supported
			if (version != 49 && version != 50)
				throw new TypeError("Invalid version value: " + String(version) + ", expected 49 or 50");
			var palLen = arr[b++];
			var colLen = arr[b++];
			if (palLen == 0) palLen = 256;
			if (colLen == 0) colLen = 256;
			for (var i = 0; i < palLen; i++) {
				if (b > arr.length)
					throw new TypeError("Expected palette data, found EOF at offset " + String(b))
				var c = arr[b++] << 16;
				c += arr[b++] << 8;
				c += arr[b++];
				im.palette.push("#" + ("00000" + c.toString(16)).slice(-6));
			}
			im.palMax = im.palette.length;
			var specsOffset = 3 + palLen * 3 + colLen * (2 + 1 * (version == 50));
			for (var i = 0; i < colLen; i++) {
				var spec = arr[b++];
				if (version == 50) spec += arr[b++] << 8;
				var p = arr[b++];
				im.columns.push({pos: p, spec: i});
				if (b >= arr.length)
					throw new TypeError("Expected column data, found EOF at offset " + String(b));
				if (p == 0 && i < colLen - 1)
					throw new TypeError("Not expected terminating column at offset " + String(b));
				if (p != 0 && i == colLen - 1)
					throw new TypeError("Expected terminating column, not found at offset " + String(b));
				var colspec = [], j = 0;
				do {
					var id = arr[specsOffset + spec * 2 + j * 2];
					var yp = arr[specsOffset + spec * 2 + j * 2 + 1];
					if (id >= im.palette.length)
						throw new TypeError("Column " + String(i) + ", spec " + String(spec) + ", entry " + String(j) + ": invalid palette index " + String(id));
					if (j > 0 && yp != 0 && yp <= colspec[j - 1].pos)
						throw new TypeError("Column " + String(i) + ", spec " + String(spec) + ", entry " + String(j) + ": invalid position: " + String(yp));
					colspec.push({pos: yp, idx: id});
					j++;
					if (yp == 0) break;
				} while (yp > 0 && b < arr.length);
				if ((specsOffset + spec * 2 + j * 2) > arr.length)
					throw new TypeError("Column " + String(i) + ", spec " + String(spec) + ", found EOF");
				im.specs.push(colspec);
			}
			im.colMax = im.columns.length;

			return im;
		},
		save: function(im) {	//	im structure as returned from newImage

			var version = 49, specsLen = 0, maxRows = 0;
			var specOffsets = [];
			for (var j = 0; j < im.specs.length; j++) {
				specOffsets.push(specsLen);
				specsLen += im.specs[j].length;
				maxRows = Math.max(im.specs[j].length, maxRows);
			}
			if (specsLen > 255)
				version = 50;	//	too many specs, extended version required
			var size =
					  1	//	version number
					+ 1	//	palette length
					+ 1	//	columns length
					+ im.palMax * 3 	//	palette (24 bit RGB color)
					+ im.colMax *   	//	columns (1 byte pos, 1 byte spec index (basic))
					(version == 50 ? 3 : 2)	//	extended format: 2 byte spec index
					+ specsLen * 2;        	//	2 bytes per row, summed over all specs

			var arr = new Uint8Array(size), b = 0;
			arr[b++] = version;
			arr[b++] = im.palMax & 0xff;	//	note that palette minimum is 1; 0 (mod 256) means 256 colors
			arr[b++] = im.colMax & 0xff;
			for (var j = 0; j < im.palMax; j++) {
				var color = Number.parseInt(im.palette[j].substring(1, 7), 16);
				arr[b++] = (color >> 16) & 0xff;
				arr[b++] = (color >>  8) & 0xff;
				arr[b++] = (color >>  0) & 0xff;
			}
			for (var j = 0; j < im.colMax; j++) {
				arr[b++] = specOffsets[im.columns[j].spec] & 0xff;
				if (version == 50) 
					arr[b++] = (specOffsets[im.columns[j].spec] >> 8) & 0xff;	//	extended format, 16-bit spec offsets
				arr[b++] = im.columns[j].pos;
			}
			for (var j = 0; j < im.specs.length; j++) {
				for (k = 0; k < im.specs[j].length; k++) {
					arr[b++] = im.specs[j][k].idx;
					arr[b++] = im.specs[j][k].pos;
				}
			}
			if (b != size) console.log("Assert: wrote bytes " + b + "instead of size " + size);
			var s = "Binary output\n"
					+ "Version: " + String.fromCharCode(version)
					+ (version == 50 ? " (extended)\n" : " (basic)\n")
					+ "Size: " + size + " bytes\n"
					+ "Colors: " + im.palMax + "\n"
					+ "Columns: " + im.colMax + "\n"
					+ "Colspecs: " + im.specs.length + "\n"
					+ "Most rows: " + maxRows + "\n";
			var u = "data:application/octet-stream;base64,"
					+ btoa(Array.from(arr, b => String.fromCodePoint(b)).join(""));
			return { asc: s, url: u };
		}
	},
	csv: {
		label: "CSV",
		supportsAscii: true,
		extension: ".csv",
		load: function(a) {	//	a instanceof ArrayData or Uint8Array
			/*	messy state machine-oriented design follows...
			 *	much cleanup could be had by pulling common statement blocks into functions,
			 *	or using simple stock array methods then tracking the line/token numbers
			 *	separately to maintain the rich error reporting.
			 */
			var s = (new TextDecoder()).decode(a);
			var im = newImage();
			s = s.replace(/[^\S\n]/g, "");	//	ignore all white space but newline; only reading numbers here
			var lines = s.split("\n");	//	break into lines
			//	remove comments (until line end)
			for (var i = 0; i < lines.length; i++) {
				const comment = lines[i].search("#");
				if (comment >= 0)
					lines[i] = lines[i].slice(0, comment);
			}
			//	tokenize into array of arrays
			var tokens = [];
			for (var i = 0; i < lines.length; i++) {
				tokens.push(lines[i].split(","));
			}
			var line = 0, token = 0;
			//	find palette and column lengths
			//	skip over starting empty or comment lines, if any
			while (tokens[line].length <= 1 && tokens[line][token] == "") {
				line++;
				if (line >= tokens.length)
					throw new TypeError("Unexpected end of file at line " + String(line));
			}
			//	first non-blank token must be palette count, followed by column count on same line
			im.palMax = Number.parseInt(tokens[line][token]);
			if (isNaN(im.palMax) || im.palMax < 2 || im.palMax > 256)
				throw new TypeError("Expected: palette count 2...256, found: " + tokens[line][token] + " at line " + String(line) + ", token " + String(token));
			token++;
			if (token >= tokens[line].length)
				throw new TypeError("Expected: column count on line " + String(line));
			im.colMax = Number.parseInt(tokens[line][token]);
			if (isNaN(im.colMax) || im.colMax < 1 || im.colMax > 256)
				throw new TypeError("Expected: column count 1...256, found: " + tokens[line][token] + " at line " + String(line) + ", token " + String(token));
			if (token < tokens[line].length - 1)
				throw new TypeError("Expected: line end on line " + String(line) + ", token " + String(token));
			token = 0;
			do {	//	Empty or comment lines allowed here
				line++;
				if (line >= tokens.length)
					throw new TypeError("Unexpected end of file at line " + String(line));
			} while (tokens[line].length <= 1 && tokens[line][token] == "");
			im.palette = [];
			for (var i = 0; i < im.palMax; i++) {
				if (token >= tokens[line].length)
					throw new TypeError("Expected: palette entry at line " + String(line) + ", token " + String(token));
				if (tokens[line][token] == "") {
					if (token == tokens[line].length - 1) {
						//	trailing comma with line end: allow continuation
						token = 0;
						do {	//	skip comment block
							line++;
							if (line >= tokens.length)
								throw new TypeError("Unexpected end of file at line " + String(line));
						} while (tokens[line].length <= 1 && tokens[line][token] == "");
					} else {
						throw new TypeError("Expected: palette entry at line " + String(line) + ", token " + String(token));
					}
				}
				if (!/^(?:[0-9a-fA-F]{6})$/.test(tokens[line][token]))
					throw new TypeError("Invalid palette entry \"" + tokens[line][token] + "\" at line " + String(line) + ", token " + String(token));
				im.palette.push("#" + tokens[line][token]);
				token++;
			}
			if (token < tokens[line].length - 1)
				throw new TypeError("Expected: line end on line " + String(line) + ", token " + String(token));
			token = 0;
			do {	//	Empty or comment lines allowed between palette and specs
				line++;
				if (line >= tokens.length)
					throw new TypeError("Unexpected end of file at line " + String(line));
			} while (tokens[line].length <= 1 && tokens[line][token] == "");
			im.columns = [];
			var posNotSpec = true, v, col = {pos: 0, spec: 0};
			for (var i = 0; i < im.colMax * 2; i++) {
				if (token >= tokens[line].length)
					throw new TypeError("Expected: column entry at line " + String(line) + ", token " + String(token));
				if (tokens[line][token] == "") {
					if (token == tokens[line].length - 1) {
						//	trailing comma with line end: allow continuation
						token = 0;
						do {	//	skip if comment block
							line++;
							if (line >= tokens.length)
								throw new TypeError("Unexpected end of file at line " + String(line));
						} while (tokens[line].length <= 1 && tokens[line][token] == "");
					} else {
						throw new TypeError("Expected: column position at line " + String(line) + ", token " + String(token));
					}
				}
				v = Number.parseInt(tokens[line][token]);
				if (posNotSpec) {
					if (isNaN(v) || v < 0 || v >= 256)
						throw new TypeError("Expected: column, position 0...255, found: " + v + " at line " + String(line) + ", token " + String(token));
					if (im.columns.length > 1 && v <= im.columns[im.columns.length - 1])
						throw new TypeError("Column position " + String(v) + " comes before proceeding column (" + String(im.columns[im.columns.length - 1]) + ") at line " + String(line) + ", token " + String(token));
					col.pos = v;
					posNotSpec = false;
				} else {
					if (isNaN(v) || v < 0 || v >= 256)
						throw new TypeError("Expected: column, colspec index 0...255, found: " + String(v) + " at line " + String(line) + ", token " + String(token));
					col.spec = v;
					posNotSpec = true;
					im.columns.push(col);
					col = {pos: 0, spec: 0};
				}
				token++;
			}
			if (token < tokens[line].length - 1)
				throw new TypeError("Expected: line end on line " + String(line) + ", token " + String(token));
			im.specs = [];
		specsLoop:
			for (var i = 0; i < 256; i++) {
				var colspec = [], row = {pos: 0, idx: 0};
				var posNotIdx = true;
				token = 0;
				do {	//	Empty or comment lines allowed before colspec
					line++;
					if (line >= tokens.length)
						break specsLoop;	//	and after, until EOF (specs done at EOF)
				} while (tokens[line].length <= 1 && tokens[line][token] == "");
				//	at start of non empty line, parse tokens into one colspec
				for (var j = 0; j < 512 && token < tokens[line].length; j++) {
					if (tokens[line][token] == "" && token == tokens[line].length - 1) {
						//	trailing comma with line end: continuation not allowed
						throw new TypeError("Expected: column position at line " + String(line) + ", token " + String(token));
					}
					v = Number.parseInt(tokens[line][token]);
					if (posNotIdx) {
						if (isNaN(v) || v < 0 || v >= 256)
							throw new TypeError("Expected: row position 0...255, found: " + String(v) + " at line " + String(line) + ", token " + String(token));
						if (v > 0 && colspec.length > 1 && v <= colspec[colspec.length - 1])
							throw new TypeError("Row position " + String(v) + " comes before proceeding row (" + String(colspec[colspec.length - 1]) + ") at line " + String(line) + ", token " + String(token));
						row.pos = v;
						posNotIdx = false;
					} else {
						if (isNaN(v) || v < 0 || v >= im.palMax)
							throw new TypeError("Expected: row color index 0..." + String(im.palMax) + ", found: " + String(v) + " at line " + String(line) + ", token " + String(token));
						row.idx = v;
						posNotIdx = true;
						colspec.push(row);
						row = {pos: 0, idx: 0};
					}
					token++;
				}
				if (colspec[colspec.length - 1].pos != 0)
					throw new TypeError("Colspec, unexpected end of line or no pos: 0 terminator at line " + String(line));
				im.specs.push(colspec);
				if (token < tokens[line].length - 1)
					throw new TypeError("Expected: line end on line " + String(line) + ", token " + String(token));
			}
			//	A correct file should be fully consumed by now, and terminated by break
			if (i == 256)
				throw new TypeError("Specs: excess data at line " + String(line));
			//	sanity check: all used specs exist
			for (var i = 0; i < im.colMax; i++) {
				if (!Array.isArray(im.specs[im.columns[i].spec]))
					throw new TypeError("Column " + String(i) + ", missing spec " + String(im.columns[i].spec));
			}
			return im;
		},
		save: function(im) {	//	im structure as returned from newImage
			im = newImage(im);
			var s = "#\tName: " + im.name + "\n";
			s += "#\tColors, Columns\n";
			s += String(im.palMax) + ", " + String(im.colMax) + "\n"
			s += "#\tPalette\n";
			s += im.palette[0].substring(1);
			for (var i = 1; i < im.palMax; i++) {
				s += ", ";
				if (i % 8 == 0) s += "\n";
				s += im.palette[i].substring(1);
			}
			s += "\n";
			s += "#\tColumns (position, spec index, ...)\n";
			s += ("   " + String(im.columns[0].pos)).slice(-3);
			s += ", " + ("   " + String(im.columns[0].spec)).slice(-3);
			for (var i = 1; i < im.colMax; i++) {
				s += ", ";
				if (i % 8 == 0) s += "\n";
				s += ("   " + String(im.columns[i].pos)).slice(-3);
				s += ", " + ("   " + String(im.columns[i].spec)).slice(-3);
			}
			s += "\n";
			s += "#\tSpecs per line (position, palette index, ...)\n";
			for (var i = 0; i < im.specs.length; i++) {
				s += ("   " + String(im.specs[i][0].pos)).slice(-3);
				s += ", " + ("   " + String(im.specs[i][0].idx)).slice(-3);
				for (j = 1; j < im.specs[i].length; j++) {
					s += ", " + ("   " + String(im.specs[i][j].pos)).slice(-3);
					s += ", " + ("   " + String(im.specs[i][j].idx)).slice(-3);
				}
				s += "\n";
			}
			var u = "data:text/csv;base64," + btoa(s);
			return { asc: s, url: u };
		}
	},
	json: {
		label: "JSON",
		supportsAscii: true,
		extension: ".json",
		load: function(a) {	//	a instanceof ArrayData or Uint8Array
			s = (new TextDecoder()).decode(a);
			var im = JSON.parse(s);
			return newImage(im);
		},
		save: function(im) {	//	im structure as returned from newImage
			//	make a minimal copy to strip off any structure modifications
			var s = JSON.stringify(newImage(im),
				["name", "palette", "columns", "specs", "pos", "spec", "idx"]);
			var u = "data:text/plain;base64," + btoa(s);
			return { asc: s, url: u };
		}
	},
	png: {
		label: "PNG",
		supportsAscii: false,
		extension: ".png",
		load: function(a) {	//	a instanceof ArrayData
			//	have to defer this one for img load
			return new Promise(function(resolve, reject) {
				//	parse PNG into pixel data
				var arr = new Uint8Array(a);
				var u = "data:image/png;base64,"
						+ btoa(Array.from(arr, b => String.fromCodePoint(b)).join(""));
				var img = document.createElement("img");
				img.addEventListener("load", function() {
					var cv = document.createElement("canvas");
					cv.width = Math.min(256, img.naturalWidth); cv.height = Math.min(256, img.naturalHeight);
					if (cv.width * cv.height < 2) throw new TypeError("Image not loaded or smaller than supported.");
					var ctx = cv.getContext("2d");
					ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
					arr = ctx.getImageData(0, 0, cv.width, cv.height);
					var m = new Map(), im = newImage();
					im.palette = []; im.columns = []; im.specs = [];
					for (var i = 0; i < arr.width; i++) {
						im.columns.push({pos: Math.floor((i + 1) * 256 / arr.width), spec: i});
						im.specs.push([]);
					}
					im.columns[im.columns.length - 1].pos = 0;
					for (var i = 0, j = 0; i < arr.data.length; i += 4) {
						var colr = "#" + (
									"00000" + (
										arr.data[i] * 65536 + arr.data[i + 1] * 256 + arr.data[i + 2]
									).toString(16)
								).slice(-6);
						if (!m.has(colr) && m.size < 256) {
							m.set(colr, j++);
							im.palette.push(colr);
						}
						im.specs[(i >> 2) % arr.width].push(
								{ pos: Math.floor(1 + i / (arr.width * 4)) * 256 / arr.height, idx: m.get(colr) || 0 } );
					}
					for (var i = 0; i < im.specs.length; i++) {
						im.specs[i][im.specs[i].length - 1].pos = 0;
					}
					im.palMax = im.palette.length;
					im.colMax = im.columns.length;
					coalesceImage(im);
					resolve(im);
				});
				img.addEventListener("error", () => reject({message: "error loading image."}) );
				img.src = u;
			});
		},
		save: function(im) {	//	im structure as returned from newImage
			//	Hidden feature, set width/height from text box after refreshing: modify ONLY the number values (2...2560)
			var cv = document.createElement("canvas");
			cv.width = 256; cv.height = 256;
			var to = document.getElementById(FILE_LOAD_IDS.textOutput), s = "";
			if (to !== null) {
				s = to.value;
				if (/^Width: [0-9]{1,4}\nHeight\: [0-9]{1,4}\nSize: /.test(s)) {
					var vals = s.split(": "), c = [];
					vals.forEach( a => c.push(Number.parseInt(a)) );
					if (c[1] > 1 && c[1] <= 2560 && c[2] > 1 && c[2] <= 2560) {
						cv.width = c[1]; cv.height = c[2];
					}
				}
			}
			cv.getContext("2d").putImageData(drawImageRef(im, cv.width, cv.height), 0, 0);
			var u = cv.toDataURL();
			s = "Width: " + String(cv.width) + "\nHeight: " + String(cv.height)
					+ "\nSize: " + atob(u.substring(22)).length + " bytes";	//	22 = "data:image/png;base64,".length
			return { asc: s, url: u };
		}
	},
	hdr: {
		label: "C Header (output only)",
		supportsAscii: true,
		extension: ".h",
		load: function(a) {	//	a instanceof ArrayData or Uint8Array
			throw new DOMException("Header input not supported", "NotSupportedError");
		},
		save: function(im) {	//	im structure as returned from newImage
			//	TODO
			var s = "TODO: C header output\n"
			var u = "data:text/plain;base64," + btoa(s);
			return { asc: s, url: u };
		}
	}
};
