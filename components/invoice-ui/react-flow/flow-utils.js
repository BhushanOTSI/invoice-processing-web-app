import { PROCESS_STATUS } from "@/app/constants";
import ELK from "elkjs/lib/elk.bundled.js";
const elk = new ELK();

export const getCurrentFont = () => {
  return `bold 12px var(--font-space-mono)`;
};

export const font = getCurrentFont();

export const mesureTextWidth = (text) => {
  const context = document.createElement("canvas").getContext("2d");
  context.font = font;
  const measured = context.measureText(text);
  const width = measured.width;

  return { width, height: 12 };
};

export const createPorts = ({
  count,
  type = "source",
  side = "SOUTH",
  id = "",
}) => {
  if (count === 0) return [];

  const ports = [];

  for (let i = 0; i < count; i++) {
    ports.push({
      id: `${id}:${type}-${i}`,
      properties: { "elk.port.side": side, type },
    });
  }

  return ports;
};

const EXECUTED_STATUSES = new Set([
  PROCESS_STATUS.SUCCESS,
  PROCESS_STATUS.FAILED,
  PROCESS_STATUS.CANCELLED,
  PROCESS_STATUS.PROCESSING,
  PROCESS_STATUS.RUNNING,
  PROCESS_STATUS.UPSTREAM_FAILED,
  PROCESS_STATUS.UP_FOR_RETRY,
  PROCESS_STATUS.DEFERRED,
  PROCESS_STATUS.COMPLETED,
]);

export function computeExecutionEdges(nodes, edges) {
  const status = Object.fromEntries(nodes.map((n) => [n.id, n.data?.status]));
  const isExecuted = (id) => EXECUTED_STATUSES.has(status[id]);

  const outgoing = {};
  edges.forEach((e) => {
    (outgoing[e.source] ||= []).push(e);
  });

  // list executed nodes
  const executed = new Set(
    nodes.filter((n) => isExecuted(n.id)).map((n) => n.id)
  );

  // DFS to collect all executed paths
  const allPaths = [];

  function dfs(node, path, edgeList) {
    const nextEdges = (outgoing[node] || []).filter((e) =>
      executed.has(e.target)
    );

    if (nextEdges.length === 0) {
      allPaths.push({ path: [...path], edges: [...edgeList] });
      return;
    }

    for (const e of nextEdges) {
      dfs(e.target, [...path, e.target], [...edgeList, e.id]);
    }
  }

  // start DFS from all nodes with no executed incoming edges
  const incoming = {};
  edges.forEach((e) => {
    (incoming[e.target] ||= []).push(e);
  });

  const starts = [...executed].filter((id) => {
    const inc = incoming[id] || [];
    return inc.every((e) => !executed.has(e.source));
  });

  for (const start of starts) {
    dfs(start, [start], []);
  }

  // pick longest path
  let longest = allPaths[0];
  for (const p of allPaths) {
    if (p.edges.length > longest.edges.length) longest = p;
  }

  const map = new Map();

  longest.edges.forEach((e, i) => {
    map.set(e, status[longest.path[i]]);
  });

  return map;
}

export const layoutGraph = async (nodes, edges) => {
  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.hierarchyHandling": "INCLUDE_CHILDREN",

      "elk.layered.maxWidth": 9999,

      "elk.layered.layering.strategy": "LONGEST_PATH",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.nodePlacement.favorStraightEdges": true,
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",

      "elk.spacing.nodeNode": 120,
      "elk.spacing.edgeNode": 40,
      "elk.spacing.edgeEdge": 25,

      "elk.layered.spacing.nodeNodeBetweenLayers": 60,
      "elk.layered.spacing.edgeNodeBetweenLayers": 50,
      "elk.layered.spacing.edgeEdgeBetweenLayers": 50,

      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.edgeRouting.useNodeShape": true,
      "elk.layered.mergeEdges": false,

      "elk.edgeLabels.inline": false,
      "elk.edgeLabels.placement": "CENTER",
      "elk.core.options.EdgeLabelPlacement": "CENTER",
      "elk.edgeLabels.planarSelfLoops": true,
      "elk.spacing.labelNode": 40,

      "elk.randomSeed": 42,
      "elk.layered.randomization.seed": 42,
      "elk.portConstraints": "FIXED_SIDE",
    },
    children: [],
    edges: [],
  };

  nodes.forEach((n) => {
    graph.children.push({
      id: n.id,
      width: n.measured.width,
      height: n.measured.height,
      ports: [
        ...createPorts({
          count: n.data?.outgoingEdgesCount,
          type: "source",
          side: "SOUTH",
          id: n.id,
        }),
        ...createPorts({
          count: n.data?.incomingEdgesCount,
          type: "target",
          side: "NORTH",
          id: n.id,
        }),
      ],
    });
  });

  edges.map((e) => {
    const label = e?.data?.label;

    const outgoingEdges = edges.filter((edge) => edge.source === e.source);
    const sourceIndex = outgoingEdges.findIndex((edge) => edge.id === e.id);

    const incomingEdges = edges.filter((edge) => edge.target === e.target);
    const targetIndex = incomingEdges.findIndex((edge) => edge.id === e.id);

    const sourcePort = `${e.source}:source-${sourceIndex}`;
    const targetPort = `${e.target}:target-${targetIndex}`;

    graph.edges.push({
      id: e.id,
      sources: [sourcePort],
      targets: [targetPort],
      labels: label
        ? [
            {
              text: label,
              ...mesureTextWidth(label),
            },
          ]
        : [],
    });
  });

  const out = await elk.layout(graph);

  const executionEdges = computeExecutionEdges(nodes, edges);

  const finalNodes = nodes.map((n) => {
    const pos = out.children.find((p) => p.id === n.id);

    return {
      ...n,
      position: { x: pos.x, y: pos.y },
      width: pos.width,
      height: pos.height,
      data: {
        ...n.data,
        ...pos,
      },
    };
  });

  const finalEdges = out.edges.map((e) => {
    const pos = edges.find((p) => p.id === e.id);

    return {
      ...pos,
      sourceHandle: e.sources[0],
      targetHandle: e.targets[0],
      data: {
        ...pos.data,
        sections: e.sections || [],
        labels: e.labels || [],
        executionEdge: executionEdges.get(e.id),
      },
    };
  });

  return {
    nodes: finalNodes.sort((a, b) => a.position.y - b.position.y),
    edges: finalEdges,
  };
};

export const generateEdgePath = (section) => {
  if (Array.isArray(section)) {
    return section.map(generateEdgePath).join(" ");
  }

  if (!section.startPoint || !section.endPoint) return "";
  const { startPoint, bendPoints = [], endPoint } = section;
  const points = [startPoint, ...bendPoints, endPoint];

  if (!points.length) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
};

export function getPolylinePoints(sections) {
  const pts = [];
  sections.forEach((s, index) => {
    // Only push startPoint for the first section to avoid duplicates
    if (index === 0) {
      pts.push(s.startPoint);
    }
    // Push bend points if they exist
    if (s.bendPoints?.length) pts.push(...s.bendPoints);
    // Always push endPoint
    pts.push(s.endPoint);
  });
  return pts;
}

export function getPolylineMidpoint(points) {
  // Handle edge cases
  if (!points || points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { x: points[0].x, y: points[0].y };

  let total = 0;
  const lens = [];

  // Calculate segment lengths
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    lens.push(len);
    total += len;
  }

  // If total length is 0 (all points are the same), return first point
  if (total === 0) return { x: points[0].x, y: points[0].y };

  const mid = total / 2;
  let acc = 0;

  // Find the segment containing the midpoint
  for (let i = 0; i < lens.length; i++) {
    if (acc + lens[i] >= mid) {
      const remain = mid - acc;
      // Avoid division by zero
      const ratio = lens[i] > 0 ? remain / lens[i] : 0;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
        y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
      };
    }
    acc += lens[i];
  }

  // Fallback to last point if we somehow don't find the midpoint
  return { x: points[points.length - 1].x, y: points[points.length - 1].y };
}

export function getPolylineMidpointXOnly(points) {
  if (!points || points.length === 0) return { x: 0, y: 0 };

  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  const midX = (minX + maxX) / 2;

  // Find the nearest actual Y to midX (or just use avg Y)
  const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  return { x: midX, y: avgY };
}
