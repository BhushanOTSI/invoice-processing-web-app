"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import "@xyflow/react/dist/style.css";
import {
  Background,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  Controls,
} from "@xyflow/react";

import { ProcessMessage } from "./process-message";
import { cn, isProcessing } from "@/lib/utils";
import { useTheme } from "next-themes";
import { CustomNode, FakeNode } from "./react-flow/CustomNode";
import { CustomNodeHandles } from "./react-flow/CustomNodeHandles";
import { CustomEdges } from "./react-flow/CustomEdges";
import { layoutGraph } from "./react-flow";

const FlowContext = createContext(null);
export const useProcessingStepsFlow = () => useContext(FlowContext);

const nodeTypes = {
  step: ({ data, id, width, height }) => {
    const { activeNodeId, setActiveNodeId } = useProcessingStepsFlow();
    const isActive = activeNodeId === id;

    return (
      <>
        <CustomNodeHandles type="target" position={Position.Top} node={data} />

        <CustomNode
          data={data}
          onClick={() => setActiveNodeId(id)}
          isActive={isActive}
          style={{ width, height }}
        />

        <CustomNodeHandles
          type="source"
          position={Position.Bottom}
          node={data}
        />
      </>
    );
  },
};

const edgeTypes = {
  processEdge: CustomEdges,
};

export const ProcessingStepsFlowProvider = ({
  children,
  dag_nodes = [],
  dag_edges = [],
}) => {
  const [nodeSizes, setNodeSizes] = useState(new Map());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);

  const registerSize = (id, size) => {
    setNodeSizes((prev) => {
      const m = new Map(prev);
      m.set(id, size);
      return m;
    });
  };

  const drawGraph = useCallback((builtNodes, builtEdges) => {
    layoutGraph(builtNodes, builtEdges).then(({ nodes, edges }) => {
      setNodes(nodes);
      setEdges(edges);
      setActiveNodeId(nodes[0]?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!dag_nodes.length) return;
    if (nodeSizes.size !== dag_nodes.length) return;

    const builtNodes = dag_nodes.map((n, i) => ({
      id: n.id,
      type: "step",
      position: { x: 0, y: 0 },
      data: {
        ...n.data,
        name: (n.data?.label || "").replace(/_/g, " "),
      },
      measured: nodeSizes.get(n.id),
    }));

    const builtEdges = dag_edges.map((e) => ({
      id: e.id,
      type: "processEdge",
      source: e.source,
      target: e.target,
      data: {
        path: "smoothstep",
        label: e.label,
      },
    }));

    dag_nodes.forEach((n) => {
      builtNodes.find((x) => x.id === n.id).data.incomingEdgesCount =
        dag_edges.filter((e) => e.target === n.id).length;

      builtNodes.find((x) => x.id === n.id).data.outgoingEdgesCount =
        dag_edges.filter((e) => e.source === n.id).length;
    });

    drawGraph(builtNodes, builtEdges);
  }, [nodeSizes, dag_nodes, dag_edges]);

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        activeNodeId,
        setActiveNodeId,
        registerSize,
        onNodesChange,
        onEdgesChange,
        drawGraph,
      }}
    >
      {children}

      {dag_nodes.map((n) => (
        <FakeNode
          registerSize={registerSize}
          key={n.id}
          id={n.id}
          data={n.data}
        />
      ))}
    </FlowContext.Provider>
  );
};

const FlowInner = () => {
  const { nodes, edges, onNodesChange, onEdgesChange } =
    useProcessingStepsFlow();
  const containerRef = useRef(null);
  const flowRef = useRef(null);
  const instanceRef = useRef(null);

  const adjustViewport = useCallback(() => {
    if (!instanceRef.current) return;
    if (!nodes.length) return;

    let targetNode = [...nodes].sort((a, b) => a.position.y - b.position.y)[0];
    const processingNode = nodes.find((n) => isProcessing(n.data.status));

    if (processingNode) {
      targetNode = processingNode;
    }

    if (!targetNode) return;
    const zoom = processingNode ? 0.8 : 0.5;
    const paddingTop = 40;

    const viewportWidth = flowRef.current.clientWidth;
    const x = targetNode.position.x;
    const y = targetNode.position.y;
    const nodeCenterX = x + targetNode.measured?.width / 2;
    const translateX = viewportWidth / 2 - nodeCenterX * zoom;

    const translateY = paddingTop - y * zoom;

    instanceRef.current.setViewport(
      {
        x: translateX,
        y: translateY,
        zoom,
      },
      { duration: 300 }
    );
  }, [nodes]);

  useEffect(() => {
    adjustViewport();
  }, [nodes, adjustViewport]);

  const onInit = (instance) => {
    instanceRef.current = instance;
    adjustViewport();
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <ReactFlow
        ref={flowRef}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        onInit={onInit}
        className={cn(isDark && "dark")}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom={0.1}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background variant="dots" />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export const ProcessingStepsFlow = () => (
  <ReactFlowProvider>
    <FlowInner />
  </ReactFlowProvider>
);

export const ActiveProcessMessage = () => {
  const { nodes, activeNodeId } = useProcessingStepsFlow();
  const node = nodes.find((n) => n.id === activeNodeId);

  const log = node?.data?.extraMetadata || {
    markdown: node?.data?.log || "No logs",
  };

  return <ProcessMessage message={{ extraMetadata: log }} />;
};
