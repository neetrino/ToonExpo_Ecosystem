# Search, Orientation And Future Routing

## Current Search

Search matches:

- builder/partner/bank public name;
- project name when published;
- custom public label;
- area code/name;
- landmark or named zone.

Selecting a result centers and highlights its map area and opens its public detail sheet.

## Current Orientation

The current delivery does not claim precise indoor positioning.

Visitor may optionally tap `I am here` and place an approximate marker manually. The marker:

- remains device-local UI state;
- is not saved to PostgreSQL;
- is not synchronized to BOS;
- does not generate a path;
- can be moved or cleared.

The map displays both the marker and selected destination. Nearby builders, banks, zones and landmarks let the visitor orient against what is visible in the real pavilion.

## No Misleading Route

Do not draw a straight line between approximate location and destination. It could cross walls, stands or restricted areas and would imply navigation accuracy the system does not have.

## Future Professional Routing

Routing begins only after real plans and walkability data are validated. The future engine will require:

- explicit `walkable`, `blocked` and `fixed_object` classifications;
- entrances/start points;
- an access point for each destination area;
- graph/grid validation;
- A* or equivalent pathfinding over walkable cells;
- route simplification for clean display;
- tests proving paths do not cross blocked geometry.

QR positioning, BLE beacons, Wi-Fi positioning and live indoor tracking are separate future decisions, not hidden dependencies of the current map.
