import { describe, expect, it } from "vitest";

import {
  dijkstraShortestPath,
  euclideanDistance,
  type GraphEdge,
  type GraphNode,
} from "./dijkstra.js";

const SAMPLE_NODES: GraphNode[] = [
  { id: "a", x: 0, y: 0 },
  { id: "b", x: 1, y: 0 },
  { id: "c", x: 1, y: 1 },
  { id: "d", x: 2, y: 1 },
];

const SAMPLE_EDGES: GraphEdge[] = [
  { fromId: "a", toId: "b", weight: 1 },
  { fromId: "b", toId: "c", weight: 1 },
  { fromId: "c", toId: "d", weight: 1 },
];

describe("dijkstraShortestPath", () => {
  it("finds the shortest path in a simple graph", () => {
    const result = dijkstraShortestPath(
      SAMPLE_NODES,
      SAMPLE_EDGES,
      "a",
      "d",
    );

    expect(result).toEqual({
      reachable: true,
      path: ["a", "b", "c", "d"],
      totalWeight: 3,
    });
  });

  it("returns unreachable when the destination is disconnected", () => {
    const nodes: GraphNode[] = [
      { id: "a", x: 0, y: 0 },
      { id: "b", x: 1, y: 0 },
      { id: "c", x: 5, y: 5 },
    ];
    const edges: GraphEdge[] = [{ fromId: "a", toId: "b", weight: 1 }];

    const result = dijkstraShortestPath(nodes, edges, "a", "c");

    expect(result).toEqual({ reachable: false });
  });

  it("treats edges as bidirectional", () => {
    const nodes: GraphNode[] = [
      { id: "a", x: 0, y: 0 },
      { id: "b", x: 2, y: 0 },
    ];
    const edges: GraphEdge[] = [{ fromId: "b", toId: "a", weight: 4 }];

    const result = dijkstraShortestPath(nodes, edges, "a", "b");

    expect(result).toEqual({
      reachable: true,
      path: ["a", "b"],
      totalWeight: 4,
    });
  });
});

describe("euclideanDistance", () => {
  it("computes distance between coordinate pairs", () => {
    expect(euclideanDistance(0, 0, 3, 4)).toBe(5);
  });
});
