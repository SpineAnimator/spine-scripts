# SYMBIOTYC Spine Scripts

A curated library of modernized utilities, scripts, plugins and add-ons for preparing assets and working with Spine.

This repository is maintained by SYMBIOTYC and is separate from the upstream
[EsotericSoftware/spine-scripts](https://github.com/EsotericSoftware/spine-scripts)
project. Upstream scripts remain the property of their respective authors and
retain their original licenses.

## Catalog

| Tool | Release | Status | Purpose |
|---|---:|---|---|
| PhotoshopToSpine | v7.54 | Source imported; static integrity CI; Photoshop/Spine runtime acceptance pending | Prepare layered Photoshop PSD artwork for Spine JSON import |

## PhotoshopToSpine v7.54

The supplied SYMBIOTYC JSX source has been added at
[`photoshop/PhotoshopToSpine_v7.54_SYMBIOTYC.jsx`](photoshop/PhotoshopToSpine_v7.54_SYMBIOTYC.jsx).

The source declares version `7.54`, is pinned by Git blob SHA-1 `f5e5b36ade492d7d0a526cd013699a9cb5340ed6` in source-integrity CI, and is described by the [machine-readable source manifest](photoshop/source-manifest.json). It retains Esoteric Software's copyright and
redistribution notice, and includes SYMBIOTYC modifications. It exports PNG
layers and Spine JSON, centers coordinates on the PSD canvas, supports
folder-to-bone hierarchy and pivots, layer/group merging, clipping masks,
overlays, skins, slots, meshes, blend modes, trimming, scale and padding.

The script is imported, but has **not** yet been run in Adobe Photoshop or
accepted by Spine Editor. Do not describe it as runtime-verified until those
checks pass. The repository's GitHub Actions workflow performs source-integrity
checks only; it does not emulate Photoshop or certify Spine import.

See [PhotoshopToSpine integration notes](photoshop/README.md).

## Runtime and native-processing boundary

The v7.54 JSX is an Adobe Photoshop ExtendScript program and depends on the
Photoshop DOM. A GitHub Ubuntu runner or Cloudflare Worker cannot execute that
DOM. A native PSD/PSB parser and renderer is a separate implementation, not a
drop-in execution of this JSX. Any native alternative must document its own
source revision, supported PSD/PSB features, rasterization limitations and
Spine Editor acceptance evidence. Do not attribute native-parser results to
the Photoshop JSX.

## Contribution and release rules

- Preserve upstream attribution and license notices.
- Keep each tool in its own directory with a README, changelog, version and tests.
- Never commit user PSDs, generated customer assets, credentials or licensed Spine binaries.
- A release must identify its exact source revision and verification evidence.
