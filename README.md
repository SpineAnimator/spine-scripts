# SYMBIOTYC Spine Scripts

A curated library of modernized utilities, scripts, plugins and add-ons for preparing assets and working with Spine.

This repository is maintained by SYMBIOTYC and is separate from the upstream
[EsotericSoftware/spine-scripts](https://github.com/EsotericSoftware/spine-scripts)
project. Upstream scripts remain the property of their respective authors and
retain their original licenses.

## Catalog

| Tool | Release | Status | Purpose |
|---|---:|---|---|
| PhotoshopToSpine | v7.54 | Integration pending source package | Prepare layered Photoshop PSD artwork for Spine JSON import |

## PhotoshopToSpine v7.54

The planned SYMBIOTYC edition is based on the Photoshop exporter originally
published by Esoteric Software. The described enhancements are:

- Centering and coordinate normalization for the exported scene.
- Layer consolidation where explicitly requested.
- Mask construction.
- Folder-to-bone hierarchy generation.
- Layer compositing/overlay handling.
- Spine JSON plus a companion images directory.

**Important:** the actual `photoshopToSpine_v7.54` JSX source and its original
license/attribution package have not yet been supplied to this repository.
The catalog entry is not a claim that the script has been published or tested.
Do not distribute a placeholder as a working exporter. Add the source only
after its exact release file, author attribution, upstream license obligations,
and supported Photoshop/Spine versions have been verified.

See [PhotoshopToSpine integration notes](photoshop/README.md).

## Contribution and release rules

- Preserve upstream attribution and license notices.
- Keep each tool in its own directory with a README, changelog, version and tests.
- Never commit user PSDs, generated customer assets, credentials or licensed Spine binaries.
- A release must identify its exact source revision and verification evidence.
