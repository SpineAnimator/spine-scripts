# PhotoshopToSpine — SYMBIOTYC v7.54

**Catalog status:** source package not yet imported; runtime integration not yet verified.

## Intended workflow

1. User supplies a layered PSD.
2. PhotoshopToSpine runs in a compatible Adobe Photoshop environment.
3. The exporter writes Spine-compatible JSON and a companion image directory.
4. The output is validated as a self-contained import package.
5. 2Spine consumes the package and continues skeleton construction or animation.

## Declared edition features

The SYMBIOTYC release description specifies:

- Centering.
- Layer consolidation.
- Mask assembly.
- Folder-to-bone conversion.
- Layer overlay/compositing.
- JSON data and exported image files.

These are release-description claims, not independently verified behavior yet.

## Source and licensing gate

The v7.54 JSX file, original upstream script reference, exact Esoteric Software
license notice, SYMBIOTYC change history and release checksum must be added
before this directory can be called a distributable release.

Do not replace this gate with a newly written approximation: the service must
execute the actual versioned exporter or a documented compatible port.

## Runtime boundary

A Photoshop JSX/ExtendScript exporter requires Photoshop. A Cloudflare Worker
cannot execute Photoshop's DOM or ExtendScript. The production design therefore
uses a Photoshop-capable execution runner for the exact JSX, or a separately
validated PSD parser/renderer that implements the same export contract. The
service must report which engine processed each job.

## Acceptance checks

- Preserve source PSD dimensions, visible layer order, group paths and alpha.
- Record hidden layers and their visibility without silently flattening them.
- Verify folder-to-bone hierarchy and mask references.
- Verify JSON references every emitted image and every emitted image is present.
- Validate the JSON against the declared Spine version.
- Package JSON and images in one ZIP with a manifest and source checksum.
- Never claim native Spine Editor acceptance without a real licensed Editor test.
