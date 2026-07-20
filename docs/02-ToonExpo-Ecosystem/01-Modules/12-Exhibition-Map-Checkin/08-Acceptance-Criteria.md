# Acceptance Criteria

## Publication Contract

- ToonExpo accepts a valid immutable `VenueMapSnapshotV1` from BOS.
- Retry of the same version/checksum is idempotent.
- A checksum conflict or older version is rejected.
- Failed/rejected publication leaves the previous active version intact.
- ToonExpo stores its own snapshot and media copy and serves public traffic without BOS.
- Hidden allocations contain no private organization identity.

## Public Experience

- Visitor can open the active event map without check-in or QR.
- Map supports pan/zoom on mobile and desktop.
- Visitor can search organization, project, public label, area code and landmark.
- Search result highlights and centers the full destination area.
- Area sheet shows only permitted public data and relevant public links.
- List fallback provides the same discoverable public destinations.
- Visual Map / Hotspots data is not mixed with exhibition venue data.

## Approximate Orientation

- Visitor may place, move and remove an approximate `I am here` marker.
- Marker remains local to the device and is not persisted.
- Map shows marker, destination and nearby landmarks simultaneously.
- No straight-line or simulated route is displayed.

## Deferred Boundaries

- Professional pathfinding is not required for current completion.
- Automatic indoor positioning and QR location markers are not required.
- Check-in scanner, attendance records and entrance staff UI are not owned by this module.

## Technical Boundary

- Next.js renders and interacts with the map.
- NestJS owns snapshot ingestion, validation, persistence, activation and public APIs.
- Prisma/PostgreSQL access does not occur in Next.js.
- Konva scene JSON is not the canonical persistence contract.
