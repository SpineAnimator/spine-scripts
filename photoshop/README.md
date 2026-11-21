# PhotoshopToSpine — SYMBIOTYC v7.54

**Source status:** imported from the supplied SYMBIOTYC v7.54 JSX file.
**Runtime status:** not yet executed in Adobe Photoshop or validated in Spine Editor.

## Source package

- Script: [PhotoshopToSpine_v7.54_SYMBIOTYC.jsx](PhotoshopToSpine_v7.54_SYMBIOTYC.jsx)
- Script version declared in source: `7.54`
- Original attribution: Esoteric Software, copyright 2012–2022.
- The source retains the complete BSD-style copyright, redistribution conditions and disclaimer. Preserve this notice in every redistribution.
- The supplied file contains SYMBIOTYC modifications beyond the upstream exporter. Those modifications must not be represented as an official Esoteric Software release.

## Confirmed from source inspection

- Exports Photoshop layers as individual PNG images and writes Spine JSON with matching positions and draw order.
- Uses the PSD canvas center as Spine origin.
- Supports `[bone]`, `[slot]`, `[skin]`, `[folder]`, `[overlay]`, `[merge]`, `[mesh]`, `[trim]`, `[ignore]`, `[scale:]`, `[path:]` and `[name:]` tags.
- Converts nested Photoshop groups/folders into a hierarchical Spine bone structure and computes group pivots from descendant artwork bounds.
- Handles Photoshop clipping layers by merging them into their base layer before attachment collection.
- Supports overlay layers as clipping masks and group merging.
- Handles blend modes, linked meshes, skins, selected-layer export, hidden/background-layer options, trimming, scale and padding.
- Can write either legacy or newer Spine JSON format through the `legacyJson` source flag.

These are source-code observations, not runtime test results.

## Intended workflow

1. User supplies a layered PSD.
2. The exact JSX runs in a compatible Adobe Photoshop environment.
3. The exporter writes Spine JSON and a companion image directory.
4. The output is validated as a self-contained import package.
5. 2Spine consumes the package and continues skeleton construction or animation.

## Runtime boundary

Photoshop JSX/ExtendScript requires Adobe Photoshop. A Cloudflare Worker cannot execute Photoshop's DOM or ExtendScript. Production processing therefore requires a Photoshop-capable runner, or a separately validated PSD parser/renderer that implements the same export contract. Each job must record which engine processed it.

## Acceptance checks

- Run the script on representative PSD fixtures in supported Photoshop versions.
- Compare source PSD dimensions, visible layer order, group paths and alpha against exported PNGs.
- Verify nested folder-to-bone pivots, mask/clipping behavior and blend modes.
- Parse generated JSON and verify every referenced image exists.
- Validate legacy and current JSON modes against the declared Spine version.
- Package JSON and images in one ZIP with a manifest and source checksum.
- Never claim native Spine Editor acceptance without a real licensed Editor test.
