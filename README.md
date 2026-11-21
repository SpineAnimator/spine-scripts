# SYMBIOTYC Spine Scripts

A curated library of modernized utilities, scripts, plugins and add-ons for preparing assets and working with Spine.

This repository is maintained by SYMBIOTYC and is separate from the upstream
[EsotericSoftware/spine-scripts](https://github.com/EsotericSoftware/spine-scripts)
project. Upstream scripts remain the property of their respective authors and
retain their original licenses.

## Catalog

| Tool | Release | Status | Purpose |
|---|---:|---|---|
| PhotoshopToSpine | v7.54 | Source imported; runtime validation pending | Prepare layered Photoshop PSD artwork for Spine JSON import |

## PhotoshopToSpine v7.54

The supplied SYMBIOTYC JSX source has been added at
[`photoshop/PhotoshopToSpine_v7.54_SYMBIOTYC.jsx`](photoshop/PhotoshopToSpine_v7.54_SYMBIOTYC.jsx).

The source declares version `7.54`, retains Esoteric Software's copyright and
redistribution notice, and includes SYMBIOTYC modifications. It exports PNG
layers and Spine JSON, centers coordinates on the PSD canvas, supports
folder-to-bone hierarchy and pivots, layer/group merging, clipping masks,
overlays, skins, slots, meshes, blend modes, trimming, scale and padding.

The script is imported, but has **not** yet been run in Photoshop or accepted by
Spine Editor. Do not describe it as runtime-verified until those checks pass.

See [PhotoshopToSpine integration notes](photoshop/README.md).

## Contribution and release rules

- Preserve upstream attribution and license notices.
- Keep each tool in its own directory with a README, changelog, version and tests.
- Never commit user PSDs, generated customer assets, credentials or licensed Spine binaries.
- A release must identify its exact source revision and verification evidence.
