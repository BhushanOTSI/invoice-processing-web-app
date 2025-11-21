import { BaseHandle } from "@/components/base-handle";

export const CustomNodeHandles = ({ type, node, isConnectable = false }) => {
  const ports = node?.ports?.filter((p) => p.properties?.type === type) || [];

  if (ports.length === 0) return null;

  return ports.map((port) => {
    const { x, y, id } = port;

    return (
      <BaseHandle
        key={id}
        id={id}
        type={type}
        position={null}
        isConnectable={isConnectable}
        style={{
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          transform: "translate(-50%, -50%)",
        }}
      />
    );
  });
};
