#target photoshop
app.bringToFront();

// https://github.com/EsotericSoftware/spine-scripts/tree/master/photoshop
// This script exports Adobe Photoshop layers as individual PNGs. It also
// writes a JSON file which can be imported into Spine where the images
// will be displayed in the same positions and draw order.

// Copyright (c) 2012-2022, Esoteric Software
// All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
//     * Neither the name of Esoteric Software nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var scriptVersion = "7.54"; // This is incremented every time the script is modified, so you know if you have the latest.

var revealAll = false; // Set to true to enlarge the canvas so layers are not cropped.
var legacyJson = true; // Set to false to output the newer Spine JSON format.

var cs2 = parseInt(app.version) < 10, cID = charIDToTypeID, sID = stringIDToTypeID, tID = typeIDToStringID;

var originalDoc, settings, progress, cancel, errors, lastLayerName;
// Shared canvas geometry is read by export helpers outside run().
var docWidth, docHeight, xOffSet, yOffSet;

try {
	originalDoc = activeDocument;
} catch (ignored) {}

// Localization. Keep tags, file names, JSON keys and Photoshop identifiers untranslated.
var translations = {
	en: {
		languageName: "English",
		language: "Language:",
		automatic: "Automatic",
		languageTooltip: "Automatic follows Photoshop's language. An explicit choice overrides it and is remembered (except in CS2).",
		settings: "Settings",
		ignoreHiddenLayers: " Ignore hidden layers",
		ignoreBackground: " Ignore background layer",
		trimWhitespace: " Trim whitespace",
		writeJson: " Write Spine JSON",
		writeTemplate: " Write template image",
		selectionOnly: " Selection only",
		scale: "Scale:",
		padding: "Padding:",
		outputPaths: "Output Paths",
		images: "Images:",
		json: "JSON:",
		help: "Help",
		ok: "OK",
		cancel: "Cancel",
		close: "Close",
		templateTooltip: "When checked, a PNG is written for the currently visible layers.",
		jsonTooltip: "When checked, a Spine JSON file is written.",
		trimTooltip: "When checked, blank pixels around the edges of each image are removed.",
		selectionTooltip: "When checked, only the selected items are processed.",
		scaleTooltip: "Scales the PNG files. Useful when using higher resolution art in Photoshop than in Spine.",
		paddingTooltip: "Blank pixels around the edge of each image. Can avoid aliasing artifacts for opaque pixels along the image edge.",
		imagesTooltip: "The folder to write PNGs. Begin with \"./\" to be relative to the PSD file. Blank to disable writing PNGs.",
		jsonPathTooltip: "Output JSON file if ending with \".json\", else the folder to write the JSON file. Begin with \"./\" to be relative to the PSD file. Blank to disable writing a JSON file.",
		noJsonOutput: "<no JSON output>",
		noImageOutput: "<no image output>",
		minimumVersion: "Photoshop CS2 or later is required.",
		noDocument: "Please open a document before running the PhotoshopToSpine script.",
		saveDocument: "Please save the document before running the PhotoshopToSpine script.",
		windowError: "\n\nScript is unable to create a Window. Your Photoshop installation may be broken and may need to be reinstalled.\n\n%1",
		scaleRange: "Scale must be between > 0 and <= 400.",
		paddingRange: "Padding must be >= 0.",
		layerContext: "[layer %1] ",
		unexpectedError: "An unexpected error has occurred:\n\n%1[line: %2] %3\n\nTo debug, run the PhotoshopToSpine script using Adobe ExtendScript with \"Debug > Do not break on guarded exceptions\" unchecked.\n\nv%4",
		initializing: "Initializing...",
		collectingLayers: "Collecting layers...",
		processingLayers: "Processing layers...",
		selectionRequired: "At least one layer must be selected when \"Selection only\" is checked.",
		rgbRequired: "Please change the image mode to RGB color.",
		invalidAttachmentName: "Layer name is not a valid attachment name:\n\n%1",
		invalidScale: "Invalid scale %1:\n\n%2",
		parentBones: "Multiple layers for the \"%1\" bone have different parent bones:\n\n%2\n%3",
		defaultSkinReserved: "The skin name \"default\" is reserved:\n\n%1\n\nPlease use a different name.",
		expectedAttachmentPrefix: "Expected attachment name \"%1\" to start with skin name: %2/",
		duplicateSkinAttachment: "Multiple layers for the \"%1\" skin in the \"%2\" slot have the same name \"%3\":\n",
		duplicateSlotAttachment: "Multiple layers for the \"%1\" slot have the same name \"%2\":\n",
		renameDuplicates: "\n\nRename or use the [ignore] tag for these layers.",
		sourceMeshNotFound: "Source mesh \"%1\" not found in slot \"%2\":\n\n%3\n\nPrepend the skin name, if any. For example:\nskinName/%1",
		sourceNotMesh: "Layer \"%1\" is not a mesh:\n\n%2",
		meshCycle: "Mesh sources form a cycle:\n\n%1",
		seeOneError: "\n\nSee errors.txt for 1 additional error.",
		seeErrors: "\n\nSee errors.txt for %1 additional errors.",
		cantWriteOneError: "\n\nUnable to write 1 additional error to errors.txt.\n%1",
		cantWriteErrors: "\n\nUnable to write %1 additional errors to errors.txt.\n%2",
		invalidGroupName: "Invalid group name:\n\n%1",
		invalidLayerName: "Invalid layer name:\n\n%1",
		layerOnlyTag: "\n\nThe [%1] tag is only valid for layers, not for groups.",
		groupOnlyTag: "\n\nThe [%1] tag is only valid for groups, not for layers.",
		invalidTag: "\n\nThe [%1] tag is not a valid tag.",
		invalidNamePattern: "The pattern for the [name:pattern] tag must contain an asterisk (*):\n\n%1",
		cannotGetLayerProperty: "Unable to get layer %1 property: %2\n%3",
		unknownType: "Unknown type: %1",
		invalidSetting: "Invalid default setting: %1",
		helpTitle: "PhotoshopToSpine - Help",
		helpText: "This script writes layers as images and creates a JSON file to bring the images into Spine with the same positions and draw order they had in Photoshop.\n"
			+ "\nThe center of the PSD canvas corresponds to 0,0 in Spine. The complete composition is positioned relative to the canvas center.\n"
			+ "\nTags in square brackets can be used anywhere in layer and group names to customize the output. If \":name\" is omitted, the layer or group name is used.\n"
			+ "\nGroup and layer names:\n"
			+ "•  [bone] or [bone:name]  Layers, slots, and bones are placed under a bone. The bone is created at the center of a visible layer. Bone groups can be nested.\n"
			+ "•  [slot] or [slot:name]  Layers are placed in a slot.\n"
			+ "•  [skin] or [skin:name]  Layers are placed in a skin. Skin layer images are output in a subfolder for the skin.\n"
			+ "•  [scale:number]  Layers are scaled. Their attachments are scaled inversely, so they appear the same size in Spine.\n"
			+ "•  [folder] or [folder:name]  Layer images are output in a subfolder. Folder groups can be nested.\n"
			+ "•  [overlay]  This layer is used as a clipping mask for all layers below.\n"
			+ "•  [trim] or [trim:false]  Force this layer to be whitespace trimmed or not.\n"
			+ "•  [mesh] or [mesh:name]  Layer is a mesh or, when a name is specified, a linked mesh.\n"
			+ "•  [ignore]  Layers, groups, and any child groups will not be output.\n"
			+ "\nGroup names:\n"
			+ "•  [merge]  Layers in the group are merged and a single image is output.\n"
			+ "•  [name:pattern]  Adds a prefix or suffix to layer names in the group. The pattern must contain an asterisk (*).\n"
			+ "\nLayer names:\n"
			+ "•  The layer name is used for the attachment or skin placeholder name, relative to any parent [skin] or [folder] groups. Can contain / for subfolders.\n"
			+ "•  [path:name]  Specifies the image file name, if it needs to be different from the attachment name. Can be used on a group with [merge].\n"
			+ "\nIf a layer name, folder name, or path name starts with / then parent layers won't affect the name."
	},
	// Based on Guto's translation, integrated with permission: https://esotericsoftware.com/forum/d/28974
	zh_CN: {
		languageName: "中文（简体）",
		language: "语言：",
		automatic: "自动",
		languageTooltip: "自动模式使用 Photoshop 的界面语言。手动选择的语言会覆盖自动设置并被记住（CS2 除外）。",
		settings: "设置",
		ignoreHiddenLayers: " 忽略隐藏图层",
		ignoreBackground: " 忽略背景图层",
		trimWhitespace: " 修剪透明像素",
		writeJson: " 写入 Spine JSON 数据",
		writeTemplate: " 创建完整预览图",
		selectionOnly: " 仅限选中图层",
		scale: "调整缩放：",
		padding: "像素填充：",
		outputPaths: "输出路径",
		images: "图像：",
		json: "JSON：",
		help: "帮助",
		ok: "确定",
		cancel: "取消",
		close: "关闭",
		templateTooltip: "选中后，将当前可见图层导出为一张 PNG 图像。",
		jsonTooltip: "选中后，生成 Spine JSON 文件。",
		trimTooltip: "选中后，移除每张图像边缘的透明像素。",
		selectionTooltip: "选中后，仅处理选中的项目。",
		scaleTooltip: "缩放 PNG 文件。适用于 Photoshop 中的原图分辨率高于 Spine 所需分辨率的情况。",
		paddingTooltip: "在每张图像的边缘添加透明像素，可避免图像边缘的不透明像素出现锯齿。",
		imagesTooltip: "PNG 文件的输出文件夹。以 \"./\" 开头表示相对于 PSD 文件的位置。留空则不输出 PNG 文件。",
		jsonPathTooltip: "以 \".json\" 结尾时指定输出 JSON 文件，否则指定其输出文件夹。以 \"./\" 开头表示相对于 PSD 文件的位置。留空则不输出 JSON 文件。",
		noJsonOutput: "<不输出 JSON>",
		noImageOutput: "<不输出图像>",
		minimumVersion: "需要 Photoshop CS2 或更高版本。",
		noDocument: "请先打开文档，再运行 PhotoshopToSpine 脚本。",
		saveDocument: "请先保存文档，再运行 PhotoshopToSpine 脚本。",
		windowError: "\n\n脚本无法创建窗口。您的 Photoshop 安装可能已损坏，需要重新安装。\n\n%1",
		scaleRange: "缩放比例必须大于 0 且小于或等于 400。",
		paddingRange: "像素填充必须大于或等于 0。",
		layerContext: "[图层 %1] ",
		unexpectedError: "发生了意外错误：\n\n%1[行号：%2] %3\n\n如需调试，请使用 Adobe ExtendScript 运行 PhotoshopToSpine 脚本，并取消勾选 \"Debug > Do not break on guarded exceptions\"。\n\nv%4",
		initializing: "正在初始化…",
		collectingLayers: "正在收集图层…",
		processingLayers: "正在处理图层…",
		selectionRequired: "勾选“仅限选中图层”时，必须至少选中一个图层。",
		rgbRequired: "请将图像模式改为 RGB 颜色。",
		invalidAttachmentName: "图层名称不是有效的附件名称：\n\n%1",
		invalidScale: "无效的缩放值 %1：\n\n%2",
		parentBones: "骨骼 \"%1\" 的多个图层具有不同的父骨骼：\n\n%2\n%3",
		defaultSkinReserved: "皮肤名称 \"default\" 是保留名称：\n\n%1\n\n请使用其他名称。",
		expectedAttachmentPrefix: "附件名称 \"%1\" 应以皮肤名称 %2/ 开头。",
		duplicateSkinAttachment: "皮肤 \"%1\" 在插槽 \"%2\" 中有多个图层使用相同的名称 \"%3\"：\n",
		duplicateSlotAttachment: "插槽 \"%1\" 中有多个图层使用相同的名称 \"%2\"：\n",
		renameDuplicates: "\n\n请重命名这些图层，或为其添加 [ignore] 标签。",
		sourceMeshNotFound: "在插槽 \"%2\" 中找不到源网格 \"%1\"：\n\n%3\n\n如果源网格属于某个皮肤，请在名称前加上皮肤名称。例如：\nskinName/%1",
		sourceNotMesh: "图层 \"%1\" 不是网格：\n\n%2",
		meshCycle: "网格源引用形成了循环：\n\n%1",
		seeOneError: "\n\n另有 1 个错误，请查看 errors.txt。",
		seeErrors: "\n\n另有 %1 个错误，请查看 errors.txt。",
		cantWriteOneError: "\n\n无法将另外 1 个错误写入 errors.txt。\n%1",
		cantWriteErrors: "\n\n无法将另外 %1 个错误写入 errors.txt。\n%2",
		invalidGroupName: "无效的组名称：\n\n%1",
		invalidLayerName: "无效的图层名称：\n\n%1",
		layerOnlyTag: "\n\n[%1] 标签仅适用于图层，不适用于组。",
		groupOnlyTag: "\n\n[%1] 标签仅适用于组，不适用于图层。",
		invalidTag: "\n\n[%1] 不是有效的标签。",
		invalidNamePattern: "[name:pattern] 标签的模式必须包含星号 (*)：\n\n%1",
		cannotGetLayerProperty: "无法获取图层 %1 的属性：%2\n%3",
		unknownType: "未知类型：%1",
		invalidSetting: "无效的默认设置：%1",
		helpTitle: "PhotoshopToSpine - 帮助",
		helpText: "此脚本将图层分层导出成图像，并创建一个 JSON 文件，以便将图像以 Photoshop 中相同的位置和绘制顺序导入 Spine 中。\n"
			+ "\nPSD 画布中心对应于 Spine 中的 0,0，整个构图均相对于画布中心定位。\n"
			+ "\n方括号中的标签可用于图层和组名称中的任何位置，以自定义输出。如果省略 \":name\"，则使用图层或组名称。\n"
			+ "\n组和图层名称：\n"
			+ "•  [bone] 或 [bone:name]  图层、插槽和骨骼放置在骨骼下。骨骼在可见图层的中心创建。骨骼组可以嵌套。\n"
			+ "•  [slot] 或 [slot:name]  图层放置在插槽中。\n"
			+ "•  [skin] 或 [skin:name]  图层放置在皮肤中。皮肤图层图像输出在皮肤的子文件夹中。\n"
			+ "•  [scale:number]  图层缩放。其附件反向缩放，因此在 Spine 中显示大小相同。\n"
			+ "•  [folder] 或 [folder:name]  图层图像输出在子文件夹中。文件夹组可以嵌套。\n"
			+ "•  [overlay]  此图层用作所有下方图层的剪切蒙版。\n"
			+ "•  [trim] 或 [trim:false]  强制此图层进行空白裁剪或不裁剪。\n"
			+ "•  [mesh] 或 [mesh:name]  图层是一个网格，或者当指定名称时，是一个链接网格。\n"
			+ "•  [ignore]  图层、组以及任何子组将不会被输出。\n"
			+ "\n组名称：\n"
			+ "•  [merge]  组内的图层将被合并，并输出为一张图像。\n"
			+ "•  [name:pattern]  为组内的图层名称添加前缀或后缀。模式必须包含星号 (*)。\n"
			+ "\n图层名称：\n"
			+ "•  图层名称用于附件或皮肤占位符名称，相对于任何父 [skin] 或 [folder] 组。可以包含 / 以表示子文件夹。\n"
			+ "•  [path:name]  指定图像文件名，如果需要与附件名称不同。可以在带有 [merge] 的组上使用。\n"
			+ "\n如果图层名称、文件夹名称或路径名称以 / 开头，则父图层不会影响名称。"
	}
};
var language = "en";

function languageForLocale (locale) {
	locale = locale.toLowerCase().replace(/-/g, "_");
	for (var id in translations) {
		if (translations.hasOwnProperty(id) && id.toLowerCase() == locale) return id;
	}
	if (locale == "zh" || /^zh_(cn|sg|hans)(_|$)/.test(locale)) return "zh_CN";
	var base = locale.split("_")[0];
	return translations.hasOwnProperty(base) ? base : "en";
}

function selectLanguage () {
	if (settings.language != "auto" && !translations.hasOwnProperty(settings.language)) settings.language = "auto";
	language = settings.language;
	if (language == "auto") {
		var locale;
		try {
			locale = app.locale;
		} catch (ignored) {}
		language = languageForLocale(locale || $.locale || "");
	}
}

function tr (key) {
	var text = translations[language][key];
	if (text === undefined) text = translations.en[key];
	var args = arguments;
	return text.replace(/%([1-9][0-9]*)/g, function (match, index) { return args[parseInt(index, 10)]; });
}

// Settings.
var defaultSettings = {
	language: "auto",
	ignoreHiddenLayers: false,
	ignoreBackground: true,
	writeTemplate: false,
	writeJson: true,
	trimWhitespace: true,
	selectionOnly: false,
	scale: 1,
	padding: 1,
	imagesDir: "./images/",
	jsonPath: "./",
};
loadSettings();
selectLanguage();

function run () {
	showProgress();

	var selectedLayers;
	if (settings.selectionOnly) {
		selectedLayers = getSelectedLayers();
		if (!selectedLayers.length) {
			alert(tr("selectionRequired"));
			return;
		}
	}

	errors = [];

	// Output dirs.
	var jsonFile = new File(jsonPath(settings.jsonPath));
	jsonFile.parent.create();
	var imagesDir = absolutePath(settings.imagesDir);
	var imagesFolder = new Folder(imagesDir);
	imagesFolder.create();

	docWidth = originalDoc.width.as("px");
	docHeight = originalDoc.height.as("px");
	// Use the PSD canvas center as Spine origin so the complete composition is centered.
	xOffSet = docWidth / 2;
	yOffSet = docHeight / 2;

	try {
		deleteDocumentAncestorsMetadata();
	} catch (ignored) {}

	originalDoc.duplicate();
	deselectLayers();

	if (revealAll) activeDocument.revealAll();

	try {
		convertToRGB();
	} catch (ignored) {}
	if (activeDocument.mode != DocumentMode.RGB) {
		alert(tr("rgbRequired"));
		return;
	}

	// Output template image.
	if (settings.writeTemplate) {
		if (settings.scale != 1) {
			storeHistory();
			scaleImage(settings.scale);
		}

		var file = new File(imagesDir + "template.png");
		if (file.exists) file.remove();

		savePNG(file);

		if (settings.scale != 1) restoreHistory();
	}

	if (!settings.jsonPath && !settings.imagesDir) return;

	rasterizeAll();

	// Add a history item to prevent layer visibility from changing by the active layer being reset to the top.
	var topLayer = activeDocument.artLayers.add();
	topLayer.name = "Collecting layers...";

	// Collect and hide layers.
	var rootLayers = [], layers = [];
	var context = {
		first: hasBackgroundLayer() ? 0 : 1,
		index: getLayerCount() - 1,
		total: 0
	};
	initializeLayers(context, selectedLayers, null, rootLayers);
	showProgress(tr("collectingLayers"), context.total);
	collectLayers(rootLayers, layers, []);

	// Store the bones, slot names, and layers for each skin.
	var bones = { _root: { name: "root", x: 0, y: 0, children: [] } };
	var slots = {}, slotsCount = 0;
	var skins = { _default: [] }, skinsCount = 0;
	var skinDuplicates = {};
	var totalLayerCount = 0;
	outer:
	for (var i = layers.length - 1; i >= 0; i--) {
		if (cancel) return;
		var layer = layers[i];

		var name = stripTags(layer.name).replace(/.png$/, "");
		name = name.replace(/[\\:"*?<>|]/g, "").replace(/^\.+$/, "").replace(/^__drag$/, ""); // Illegal.
		name = layer.applyNamePatterns(name);
		if (!name) continue;
		name = name.replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, ""); // Windows.
		if (!name || name.length > 255) {
			error(tr("invalidAttachmentName", layer.name));
			continue;
		}

		var folderPath = layer.folders("");
		if (startsWith(name, "/")) {
			name = name.substring(1);
			layer.attachmentName = name;
		} else
			layer.attachmentName = folderPath + name;

		layer.attachmentPath = layer.findTagValue("path:");
		if (!layer.attachmentPath)
			layer.attachmentPath = layer.attachmentName;
		else if (startsWith(layer.attachmentPath, "/"))
			layer.attachmentPath = layer.attachmentPath.substring(1);
		else
			layer.attachmentPath = folderPath + layer.attachmentPath;

		var scale = layer.findTagValue("scale:");
		if (!scale) scale = 1;
		layer.scale = parseFloat(scale);
		if (isNaN(layer.scale)) error(tr("invalidScale", scale, layer.path()));

		var bone = null, boneLayer = layer.findTagLayer("bone") || layer.findTagLayer("folder");
		// Every PSD group becomes a Spine bone, even when its name has no tag.
		// Explicit [bone] / [folder] tags on a layer still take precedence.
		if (!boneLayer) {
			boneLayer = layer;
			while (boneLayer && !boneLayer.isGroup) boneLayer = boneLayer.parent;
		}
		if (boneLayer) {
			var parent = boneLayer.getParentBone(bones);
			var boneName = boneLayer.findTagValue("bone") || boneLayer.findTagValue("folder") || stripTags(boneLayer.name);
			if (!boneName) boneName = "bone";
			bone = get(bones, boneName);
			if (bone) {
				if (parent != bone.parent) {
					error(tr("parentBones", boneName, bone.layer.path(), boneLayer.path()));
					continue;
				}
			} else {
				set(bones, boneName, bone = { name: boneName, parent: parent, children: [], layer: boneLayer });
				parent.children.push(bone);
			}
			layer.updateBounds();
			// Include descendant artwork in every ancestor group's pivot bounds.
			// This gives even empty parent folders a meaningful center.
			for (var boundsBone = bone; boundsBone && boundsBone.parent; boundsBone = boundsBone.parent) {
				if (!boundsBone.bounds) boundsBone.bounds = { left: layer.left, top: layer.top, right: layer.right, bottom: layer.bottom };
				else {
					boundsBone.bounds.left = Math.min(boundsBone.bounds.left, layer.left);
					boundsBone.bounds.top = Math.min(boundsBone.bounds.top, layer.top);
					boundsBone.bounds.right = Math.max(boundsBone.bounds.right, layer.right);
					boundsBone.bounds.bottom = Math.max(boundsBone.bounds.bottom, layer.bottom);
				}
			}
		}

		var skinName = null;
		var skinLayer = layer.findTagLayer("skin");
		if (skinLayer) {
			skinName = skinLayer.getTagValue("skin");
			if (startsWith(skinName, "/"))
				skinName = skinName.substring(1);
			else if (skinLayer.parent)
				skinName = skinLayer.parent.folders("") + skinName;
			if (skinName && skinName.toLowerCase() == "default") {
				error(tr("defaultSkinReserved", layer.path()));
				continue;
			}
		}
		if (!skinName) skinName = "default";
		layer.skinName = skinName;

		if (skinName == "default")
			layer.placeholderName = layer.attachmentName;
		else if (!startsWith(layer.attachmentName, skinName + "/")) { // Should never happen.
			error(tr("expectedAttachmentPrefix", layer.attachmentName, skinName));
			continue;
		} else
			layer.placeholderName = layer.attachmentName.substring(skinName.length + 1);

		layer.mesh = layer.findTagValue("mesh", true);
		var trim = layer.findTagValue("trim");
		layer.trim = trim != null ? trim != "false" : settings.trimWhitespace;

		layer.slotName = layer.findTagValue("slot") || name;
		var slot = get(slots, layer.slotName);
		if (!slot) {
			slotsCount++;
			set(slots, layer.slotName, slot = {
				bone: bone,
				attachment: layer.wasVisible ? layer.placeholderName : null,
				placeholders: {},
				attachments: false,
				layers: {}
			});
		} else if (!slot.attachment && layer.wasVisible)
			slot.attachment = layer.placeholderName;
		set(slot.layers, layer.attachmentName, layer);
		if (layer.blendMode == "linearDodge")
			slot.blend = "additive";
		else if (layer.blendMode == "multiply")
			slot.blend = "multiply";
		else if (layer.blendMode == "screen")
			slot.blend = "screen";

		var placeholders = get(slot.placeholders, skinName);
		if (!placeholders)
			set(slot.placeholders, skinName, placeholders = {});
		else {
			var existing = get(placeholders, layer.placeholderName);
			if (existing) { // Skin has duplicate placeholders.
				var key = layer.slotName + "|^`" + skinName;
				remove(skinDuplicates, key, existing);
				add(skinDuplicates, key, existing);
				add(skinDuplicates, key, layer);
			}
		}
		set(placeholders, layer.placeholderName, layer);

		var skinSlots = get(skins, skinName);
		if (!skinSlots) {
			set(skins, skinName, skinSlots = {});
			skinsCount++;
		}
		add(skinSlots, layer.slotName, layer);

		totalLayerCount++;
	}

	// Convert accumulated Photoshop-space folder bounds to absolute Spine-space
	// pivots. outputBone later converts these to parent-relative coordinates.
	for (var boneName in bones) {
		if (!bones.hasOwnProperty(boneName)) continue;
		var bone = bones[boneName];
		if (!bone.bounds) continue;
		var centerX = (bone.bounds.left + bone.bounds.right) / 2;
		var centerY = (bone.bounds.top + bone.bounds.bottom) / 2;
		bone.x = (centerX - xOffSet) * settings.scale;
		bone.y = (yOffSet - centerY) * settings.scale;
		delete bone.bounds;
	}

	// Error if a skin has multiple skin placeholders with the same name.
	for (var key in skinDuplicates) {
		if (!skinDuplicates.hasOwnProperty(key)) continue;
		var layers = skinDuplicates[key];
		var message = tr("duplicateSkinAttachment", layers[0].skinName, layers[0].slotName, layers[0].placeholderName);
		for (var i = 0, n = layers.length; i < n; i++)
			message += "\n" + layers[i].path();
		error(message + tr("renameDuplicates"));
	}

	var slotDuplicates = {};
	for (var slotName in slots) {
		if (!slots.hasOwnProperty(slotName)) continue;
		var slot = slots[slotName];

		// Error if a source mesh isn't found in the same slot.
		var layers = slot.layers;
		for (var attachmentName in layers) {
			if (!layers.hasOwnProperty(attachmentName)) continue;
			var layer = layers[attachmentName];
			if (!layer.mesh) continue;
			if (layer.mesh === true) continue;
			var source = get(layers, layer.mesh);
			if (!source) {
				error(tr("sourceMeshNotFound", layer.mesh, stripName(slotName), layer.path()));
				continue;
			}
			if (!source.mesh) {
				error(tr("sourceNotMesh", source.path(), layer.path()));
				continue;
			}
			layer.mesh = source;
		}

		// Error if a skin placeholder has the same name as a default skin attachment.
		var defaultPlaceholders = get(slot.placeholders, "default");
		if (!defaultPlaceholders) continue;
		for (var skinName in slot.placeholders) {
			if (!slot.placeholders.hasOwnProperty(skinName)) continue;
			var placeholders = slot.placeholders[skinName];
			if (stripName(skinName) == "default") continue;

			for (var placeholderName in placeholders) {
				if (!placeholders.hasOwnProperty(placeholderName)) continue;

				var existing = get(defaultPlaceholders, stripName(placeholderName));
				if (existing) {
					var layer = placeholders[placeholderName];
					remove(slotDuplicates, layer.slotName, existing);
					add(slotDuplicates, layer.slotName, existing);
					add(slotDuplicates, layer.slotName, layer);
				}
			}
		}
	}
	for (var slotName in slotDuplicates) {
		if (!slotDuplicates.hasOwnProperty(slotName)) continue;
		var layers = slotDuplicates[slotName];
		var message = tr("duplicateSlotAttachment", layers[0].slotName, layers[0].placeholderName);
		for (var i = 0, n = layers.length; i < n; i++)
			message += "\n" + layers[i].path();
		error(message + tr("renameDuplicates"));
	}

	if (!errors.length) {
		for (var slotName in slots) {
			if (!slots.hasOwnProperty(slotName)) continue;
			var layers = slots[slotName].layers;
			for (var attachmentName in layers) {
				if (!layers.hasOwnProperty(attachmentName)) continue;
				var layer = layers[attachmentName];
				if (!layer.mesh) continue;
				var source = layer, visited = [];
				while (source.mesh !== true) {
					if (indexOf(visited, source) != -1) {
						error(tr("meshCycle", layer.path()));
						break;
					}
					visited.push(source);
					source = source.mesh;
				}
				if (source.mesh === true && source.trim) layer.scaledMeshSource = source;
			}
		}
	}

	var n = errors.length;
	if (n) {
		var first = errors[0];
		var file = null;
		if (n > 1) {
			try {
				var all = "";
				for (var i = 0; i < n; i++) {
					if (i > 0) all += "---\n";
					all += errors[i].replace(/\n\n/g, "\n") + "\n";
				}
				file = new File(jsonFile.parent + "/errors.txt");
				file.parent.create();
				file.encoding = "UTF-8";
				file.remove();
				file.open("w", "TEXT");
				file.lineFeed = "\n";
				file.write(all);
				file.close();
				if (n == 2)
					first += tr("seeOneError");
				else
					first += tr("seeErrors", n - 1);
			} catch (e) {
				if (n == 2)
					first += tr("cantWriteOneError", e);
				else
					first += tr("cantWriteErrors", n - 1, e);
			}
		}
		alert(first);
		if (file) file.execute();
		return;
	}

	// Add a history item to prevent layer visibility from changing by restoreHistory.
	topLayer.name = "Processing layers...";
	showProgress(tr("processingLayers"), totalLayerCount);

	// Output skins.
	var jsonSkins = "", layerCount = 0, writeImages = settings.imagesDir, tabs = legacyJson ? '\t\t' : '\t\t\t';
	for (var skinName in skins) {
		if (!skins.hasOwnProperty(skinName)) continue;
		var skinSlots = skins[skinName];
		skinName = stripName(skinName);

		var jsonSkin = "";
		for (var slotName in skinSlots) {
			if (!skinSlots.hasOwnProperty(slotName)) continue;
			var slot = slots[slotName];
			var bone = slot.bone;
			var skinLayers = skinSlots[slotName];
			slotName = stripName(slotName);

			var jsonSlot = "";
			var outputLayer = function (layer) {
				if (layer.json != null) return layer.json;
				var output = layer, meshSource = layer.scaledMeshSource;
				output.json = "";
				// Prepare the source once, even when a linked layer appears earlier or in another skin.
				if (meshSource && meshSource != layer && !outputLayer(meshSource)) return "";
				layerCount++;
				layer.show();

				incrProgress(layer.name);
				if (cancel) return "";

				var attachmentName = layer.attachmentName, attachmentPath = layer.attachmentPath, placeholderName = layer.placeholderName, mesh = layer.mesh;
				var scale = layer.scale, overlays = layer.overlays;

				var trim = layer.trim;
				if (meshSource) {
					trim = true;
					scale = meshSource.scale;
					if (mesh !== true) mesh = meshSource;
				}

				if (layer.isGroup) {
					layer.select();
					merge();
					layer = new Layer(layer.id, layer.parent, layer.selected);
				}
				layer.rasterizeStyles();

				for (var ii = 0, nn = overlays.length; ii < nn; ii++) {
					var overlay = overlays[ii];
					overlay.moveAbove(layer);
					overlay.setClippingMask(true);
					overlay.show();
				}

				var sourceImage = meshSource && meshSource != output ? meshSource.scaledImage : null;
				var bounds = sourceImage ? sourceImage.bounds : mesh && mesh != true ? mesh : layer;
				if (!sourceImage) bounds.updateBounds();
				if (!bounds.width || !bounds.height) {
					layer.hide();
					return "";
				}
				slot.attachments = true;

				storeHistory();

				var x, y, width, height, attachmentImage;
				if (mesh && !meshSource) {
					if (trim) {
						x = bounds.left;
						y = bounds.top;
						width = bounds.width;
						height = bounds.height;
						activeDocument.crop([x - xOffSet, y - yOffSet, bounds.right - xOffSet, bounds.bottom - yOffSet], 0, width, height);
						x *= settings.scale;
						y *= settings.scale;
					} else {
						x = 0;
						y = 0;
						width = docWidth;
						height = docHeight;
					}
					width = width * settings.scale + settings.padding * 2;
					height = height * settings.scale + settings.padding * 2;
					if (writeImages) {
						scaleImage(settings.scale * scale);
						if (settings.padding > 0) activeDocument.resizeCanvas(width * scale, height * scale, AnchorPosition.MIDDLECENTER);
					}
					x -= settings.padding;
					y = settings.padding - y;
					width = Math.round(width * scale);
					height = Math.round(height * scale);
				} else {
					attachmentImage = scaleAttachmentImage(layer, trim, scale, sourceImage);
					if (meshSource) output.scaledImage = attachmentImage;
					x = attachmentImage.x;
					y = -attachmentImage.y;
					width = attachmentImage.width;
					height = attachmentImage.height;
				}

				// Save image.
				if (writeImages) {
					var file = new File(imagesDir + attachmentPath + ".png");
					file.parent.create();
					savePNG(file);
				}
				restoreHistory();

				if (layerCount < totalLayerCount) layer.hide();

				// Make relative to the center of the PSD canvas.
				x -= xOffSet * settings.scale;
				y += yOffSet * settings.scale;

				if (bone) { // Make relative to parent bone.
					x -= bone.x;
					y -= bone.y;
				}

				var json = "\t" + tabs + quote(placeholderName) + ': { ';
				if (attachmentName != placeholderName) json += '"name": ' + quote(attachmentName) + ', ';
				if (attachmentName != attachmentPath) json += '"path": ' + quote(attachmentPath) + ', ';
				if (mesh) {
					if (mesh === true)
						json += '"type": "mesh", ';
					else {
						json += '"type": "linkedmesh", "source": "' + mesh.placeholderName + '", "parent": "' + mesh.placeholderName + '", ';
						if (mesh.skinName) json += '"skin": "' + mesh.skinName + '", ';
					}
					var meshWidth = width, meshHeight = height;
					if (attachmentImage) {
						meshWidth *= attachmentImage.scaleX;
						meshHeight *= attachmentImage.scaleY;
						x -= meshWidth / 2;
						y += meshHeight / 2;
					}
					json += '"width": ' + width + ', "height": ' + height + ', "vertices": [ ';
					json += (x + meshWidth) + ', ' + (y - meshHeight) + ', ';
					json += x + ', ' + (y - meshHeight) + ', ';
					json += x + ', ' + y + ', ';
					json += (x + meshWidth) + ', ' + y + ' ], "uvs": [ 1, 1, 0, 1, 0, 0, 1, 0 ], "triangles": [ 1, 2, 3, 1, 3, 0 ], "hull": 4, "edges": [ 0, 2, 2, 4, 4, 6, 0, 6 ]';
				} else {
					json += '"x": ' + x + ', "y": ' + y + ', "width": ' + width + ', "height": ' + height;
					if (attachmentImage.scaleX != 1) json += ', "scaleX": ' + attachmentImage.scaleX;
					if (attachmentImage.scaleY != 1) json += ', "scaleY": ' + attachmentImage.scaleY;
				}
				json += ' },\n';
				return output.json = json;
			};
			for (var i = skinLayers.length - 1; i >= 0; i--) {
				jsonSlot += outputLayer(skinLayers[i]);
				if (cancel) return;
			}
			if (jsonSlot) jsonSkin += tabs + quote(slotName) + ': {\n' + jsonSlot.substring(0, jsonSlot.length - 2) + '\n' + tabs + '\},\n';
		}
		if (jsonSkin) {
			if (legacyJson)
				jsonSkins += '\t"' + skinName + '": {\n' + jsonSkin.substring(0, jsonSkin.length - 2) + '\n\t},\n';
			else
				jsonSkins += '\t{\n\t\t"name": ' + quote(skinName) + ',\n\t\t"attachments": {\n' + jsonSkin.substring(0, jsonSkin.length - 2) + '\n\t\t}\n\t},\n';
		}
	}
	lastLayerName = null;

	activeDocument.close(SaveOptions.DONOTSAVECHANGES);

	// Output skeleton.
	var json = '{ "skeleton": { "images": "' + imagesDir + '" },\n';
	json += '"PhotoshopToSpine": { "scale": ' + settings.scale + ', "padding": ' + settings.padding + ', "trim": ' + settings.trimWhitespace + ' },\n';
	json += '"bones": [\n';

	// Output bones.
	function outputBone (bone) {
		var json = bone.parent ? ',\n' : '';
		json += '\t{ "name": ' + quote(bone.name);
		var x = bone.x, y = bone.y;
		if (bone.parent) {
			x -= bone.parent.x;
			y -= bone.parent.y;
			json += ', "parent": ' + quote(bone.parent.name);
		}
		if (x) json += ', "x": ' + x;
		if (y) json += ', "y": ' + y;
		json += ' }';
		for (var i = 0, n = bone.children.length; i < n; i++)
			json += outputBone(bone.children[i]);
		return json;
	}
	for (var boneName in bones) {
		if (cancel) return;
		if (!bones.hasOwnProperty(boneName)) continue;
		var bone = bones[boneName];
		if (!bone.parent) json += outputBone(bone);
	}
	json += '\n],\n"slots": [\n';

	// Output slots.
	var slotIndex = 0, slotOutputCount = 0;
	for (var countSlotName in slots)
		if (slots.hasOwnProperty(countSlotName) && slots[countSlotName].attachments) slotOutputCount++;
	for (var slotName in slots) {
		if (cancel) return;
		if (!slots.hasOwnProperty(slotName)) continue;
		var slot = slots[slotName];
		if (!slot.attachments) continue;
		slotName = stripName(slotName);
		json += '\t{ "name": ' + quote(slotName) + ', "bone": ' + quote(slot.bone ? slot.bone.name : "root");
		if (slot.attachment) json += ', "attachment": ' + quote(slot.attachment);
		if (slot.blend) json += ', "blend": ' + quote(slot.blend);
		json += ' }';
		slotIndex++;
		json += slotIndex < slotOutputCount ? ',\n' : '\n';
	}
	json += '],\n';

	if (jsonSkins) {
		if (legacyJson)
			json += '"skins": {\n' + jsonSkins.substring(0, jsonSkins.length - 2) + '\n},\n';
		else
			json += '"skins": [\n' + jsonSkins.substring(0, jsonSkins.length - 2) + '\n],\n';
	}

	json += '"animations": { "animation": {} }\n}';

	// Output JSON file.
	if (settings.writeJson && settings.jsonPath) {
		if (cancel) return;
		jsonFile.encoding = "UTF-8";
		jsonFile.remove();
		jsonFile.open("w", "TEXT");
		jsonFile.lineFeed = "\n";
		jsonFile.write(json);
		jsonFile.close();
	}
}

// Settings dialog:

function showSettingsDialog () {
	if (parseInt(app.version) < 9) {
		alert(tr("minimumVersion"));
		return;
	}
	if (!originalDoc) {
		alert(tr("noDocument"));
		return;
	}
	try {
		decodeURI(activeDocument.path);
	} catch (e) {
		alert(tr("saveDocument"));
		return;
	}

	// Layout.
	var localized = [];
	function text (parent, type, key, properties) {
		var control = parent.add(type, undefined, tr(key), properties);
		localized.push({control: control, key: key, property: "text"});
		return control;
	}
	function tooltip (control, key) {
		control.helpTip = tr(key);
		localized.push({control: control, key: key, property: "helpTip"});
	}
	var dialog, group;
	try {
		dialog = new Window("dialog", "PhotoshopToSpine v" + scriptVersion);
	} catch (e) {
		throw new Error(tr("windowError", e.message));
	}
	dialog.alignChildren = "fill";

	try {
		dialog.add("image", undefined, new File(scriptDir() + "logo.png"));
	} catch (ignored) {}

	var languageGroup = dialog.add("group");
	text(languageGroup, "statictext", "language");
	var languageSelect = languageGroup.add("dropdownlist"), languageIDs = ["auto"];
	languageSelect.add("item", tr("automatic"));
	for (var id in translations) {
		if (!translations.hasOwnProperty(id)) continue;
		languageIDs.push(id);
		languageSelect.add("item", translations[id].languageName);
	}
	languageSelect.selection = indexOf(languageIDs, settings.language);
	tooltip(languageSelect, "languageTooltip");

	var settingsGroup = text(dialog, "panel", "settings");
		settingsGroup.margins = [10,15,10,10];
		settingsGroup.alignChildren = "fill";
		var checkboxGroup = settingsGroup.add("group");
			checkboxGroup.alignChildren = ["left", ""];
			checkboxGroup.orientation = "row";
			group = checkboxGroup.add("group");
				group.orientation = "column";
				group.alignChildren = ["left", ""];
				var ignoreHiddenLayersCheckbox = text(group, "checkbox", "ignoreHiddenLayers");
				ignoreHiddenLayersCheckbox.value = settings.ignoreHiddenLayers;
				var ignoreBackgroundCheckbox = text(group, "checkbox", "ignoreBackground");
				ignoreBackgroundCheckbox.value = settings.ignoreBackground;
				var trimWhitespaceCheckbox = text(group, "checkbox", "trimWhitespace");
				trimWhitespaceCheckbox.value = settings.trimWhitespace;
			group = checkboxGroup.add("group");
				group.orientation = "column";
				group.alignChildren = ["left", ""];
				group.alignment = ["", "top"];
				var writeJsonCheckbox = text(group, "checkbox", "writeJson");
				writeJsonCheckbox.value = settings.writeJson;
				var writeTemplateCheckbox = text(group, "checkbox", "writeTemplate");
				writeTemplateCheckbox.value = settings.writeTemplate;
				var selectionOnlyCheckbox = text(group, "checkbox", "selectionOnly");
				selectionOnlyCheckbox.value = settings.selectionOnly;
		var scaleText, paddingText, scaleSlider, paddingSlider;
		if (!cs2) {
			var slidersGroup = settingsGroup.add("group");
				group = slidersGroup.add("group");
					group.orientation = "column";
					group.alignChildren = ["right", ""];
					text(group, "statictext", "scale");
					text(group, "statictext", "padding");
				group = slidersGroup.add("group");
					group.orientation = "column";
					scaleText = group.add("edittext", undefined, settings.scale * 100);
					scaleText.characters = 4;
					paddingText = group.add("edittext", undefined, settings.padding);
					paddingText.characters = 4;
				group = slidersGroup.add("group");
					group.orientation = "column";
					group.add("statictext", undefined, "%");
					group.add("statictext", undefined, "px");
				group = slidersGroup.add("group");
					group.orientation = "column";
					group.alignChildren = ["fill", ""];
					group.alignment = ["fill", ""];
					scaleSlider = group.add("slider", undefined, settings.scale * 100, 1, 400);
					paddingSlider = group.add("slider", undefined, settings.padding, 0, 4);
		} else {
			group = settingsGroup.add("group");
				text(group, "statictext", "scale");
				scaleText = group.add("edittext", undefined, settings.scale * 100);
				scaleText.preferredSize.width = 50;
			scaleSlider = settingsGroup.add("slider", undefined, settings.scale * 100, 1, 400);
			group = settingsGroup.add("group");
				text(group, "statictext", "padding");
				paddingText = group.add("edittext", undefined, settings.padding);
				paddingText.preferredSize.width = 50;
			paddingSlider = settingsGroup.add("slider", undefined, settings.padding, 0, 4);
		}

	if (cs2) {
		ignoreHiddenLayersCheckbox.preferredSize.width = 150;
		ignoreBackgroundCheckbox.preferredSize.width = 150;
		trimWhitespaceCheckbox.preferredSize.width = 150;
		writeJsonCheckbox.preferredSize.width = 150;
		writeTemplateCheckbox.preferredSize.width = 150;
		selectionOnlyCheckbox.preferredSize.width = 150;
	}

	var outputPathGroup = text(dialog, "panel", "outputPaths");
		outputPathGroup.alignChildren = ["fill", ""];
		outputPathGroup.margins = [10,15,10,10];
		var imagesDirText, imagesDirPreview, jsonPathText, jsonPathPreview;
		if (!cs2) {
			var textGroup = outputPathGroup.add("group");
			textGroup.orientation = "column";
			textGroup.alignChildren = ["fill", ""];
			group = textGroup.add("group");
				text(group, "statictext", "images");
				imagesDirText = group.add("edittext", undefined, settings.imagesDir);
				imagesDirText.alignment = ["fill", ""];
			imagesDirPreview = textGroup.add("statictext", undefined, "");
			imagesDirPreview.maximumSize.width = 260;