# Search And Route Path

## Search Goal

Visitor should quickly find:

- builder company;
- project;
- bank;
- partner;
- booth code.

## Search Inputs

Search should match:

- company name;
- project name;
- booth code;
- partner type;
- bank name.

## Search Result

Result card should show:

- company/project name;
- booth code;
- type;
- short location hint;
- open on map action;
- route/path action if available.

## Route / Path

Route/path helps visitor walk from entrance/current point to selected booth.

v1 can support simple path if map graph is configured.

## Route Data

Route building needs:

- start point;
- destination booth;
- path nodes;
- path edges;
- map coordinates.

## Start Point

Recommended v1 start points:

- main entrance;
- selected entrance;
- current point selected manually.

True live indoor positioning is out of scope.

## Route Flow

```text
Visitor searches company/project
-> selects result
-> system highlights booth
-> visitor taps Route
-> system draws path from entrance/start point
```

## Fallback Without Route Graph

If route graph is not configured:

- highlight booth;
- show booth code;
- show location text;
- optionally show "Route not available yet".

## Route Is Not GPS

Do not promise precise live navigation in v1.

Route is visual guidance on venue map.

## Mobile

Route/path should be visible on mobile:

- highlighted path;
- destination label;
- reset/back action;
- search remains accessible.

