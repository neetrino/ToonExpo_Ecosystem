# Published Snapshot And Areas

## Canonical Input

ToonExpo receives `VenueMapSnapshotV1`, not arbitrary map editor commands and not a list of percentage markers.

The snapshot contains:

- schema version and immutable snapshot version;
- BOS map/cycle external identifiers;
- checksum and publication timestamp;
- normalized background asset descriptor;
- public map dimensions;
- public area geometry and labels;
- public landmarks;
- eligible organization/project references;
- optional future-routing classifications and access points.

## Area Geometry

The public viewer receives derived area geometry produced from BOS metric cells. ToonExpo does not recalculate ownership, area sales or grid overlap.

The source grid may be omitted from normal public rendering. Visitors see clean area fills, outlines, names and landmarks.

## Public Display Mode

```text
organization
custom_label
hidden
```

Default for a publish-eligible allocation is `organization`; `custom_label` and `hidden` must be selected explicitly in BOS.

- `organization`: show the public Company identity and available public links.
- `custom_label`: show only the supplied public label.
- `hidden`: show neutral/empty geometry with no occupant identity.

For `hidden`, BOS omits organization identity from the payload. ToonExpo cannot reveal it through another endpoint or client state.

## Eligibility

- builder identity is publishable after the related BOS BuilderDeal is `won`;
- partner identity is publishable after PartnerParticipation is `confirmed`;
- earlier/internal allocation stages may render as neutral areas only.

## Snapshot Activation

ToonExpo validates and stores the complete immutable version before activation. A rejected/failed version never partially replaces the active public map.
