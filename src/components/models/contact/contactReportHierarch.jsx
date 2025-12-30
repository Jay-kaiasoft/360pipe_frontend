import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

/** ---------- Custom pill node ---------- */
function PillNode({ data }) {
  const bg =
    data?.variant === "primary"
      ? "#0B4DBA" // top blue
      : data?.variant === "success"
        ? "#2E7D32" // green
        : "#2F6FEB"; // default blue

  return (
    <div
      style={{
        padding: "10px 18px",
        minWidth: 130,
        textAlign: "center",
        borderRadius: 999,
        color: "#fff",
        fontWeight: 700,
        fontSize: 12,
        background: bg,
        boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
        userSelect: "none",
      }}
    >
      {data?.label}
    </div>
  );
}

const nodeTypes = { pill: PillNode };

/** ---------- Dagre layout helper (top-to-bottom) ---------- */
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

function layoutElements(nodes, edges, direction = "TB") {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction, // TB = top-bottom
    nodesep: 40,
    ranksep: 55,
  });

  nodes.forEach((n) => {
    // dagre needs width/height for each node
    dagreGraph.setNode(n.id, { width: 160, height: 44 });
  });

  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));

  dagre.layout(dagreGraph);

  const laidOutNodes = nodes.map((n) => {
    const nodeWithPosition = dagreGraph.node(n.id);
    return {
      ...n,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      position: {
        x: nodeWithPosition.x - 160 / 2,
        y: nodeWithPosition.y - 44 / 2,
      },
    };
  });

  return { nodes: laidOutNodes, edges };
}

/** ---------- Example data (replace with your API data) ---------- */
const sampleHierarchy = {
  id: "1",
  name: "Angela Oliveri",
  variant: "primary",
  children: [
    {
      id: "2",
      name: "Tony Oliveri",
      variant: "success",
      children: [
        { id: "3", name: "Lorem Ipsum" },
        { id: "4", name: "Lorem Ipsum" },
      ],
    },
    {
      id: "5",
      name: "Dave Edwards",
      variant: "primary",
      children: [
        { id: "6", name: "Lorem Ipsum" },
        { id: "7", name: "Lorem Ipsum" },
      ],
    },
  ],
};

/** ---------- Convert tree -> ReactFlow nodes/edges ---------- */
function buildFlowFromTree(root) {
  const nodes = [];
  const edges = [];

  function walk(node, parentId = null) {
    nodes.push({
      id: String(node.id),
      type: "pill",
      position: { x: 0, y: 0 }, // will be set by layout
      data: {
        label: node.name,
        variant: node.variant,
      },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: String(parentId),
        target: String(node.id),
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
        style: { stroke: "#9CA3AF", strokeWidth: 2 },
      });
    }

    (node.children || []).forEach((child) => walk(child, node.id));
  }

  walk(root);
  return { nodes, edges };
}

export default function ContactReportHierarch() {
  // If you have API data, replace sampleHierarchy with your state data:
  const treeData = useMemo(() => sampleHierarchy, []);

  const built = useMemo(() => buildFlowFromTree(treeData), [treeData]);
  const laidOut = useMemo(
    () => layoutElements(built.nodes, built.edges, "TB"),
    [built.nodes, built.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(laidOut.edges);

  // Re-apply layout if data changes
  useEffect(() => {
    const next = layoutElements(built.nodes, built.edges, "TB");
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [built.nodes, built.edges, setNodes, setEdges]);

  return (
    <div
      style={{
        width: "100%",
        height: 360,
        padding: 16,
      }}
    >
      {/* Outer rounded container like your screenshot */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#DDEFD5", // light green
          borderRadius: 32,
          border: "2px solid rgba(0,0,0,0.25)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
          overflow: "hidden",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={22} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}


// import React, { useEffect, useState } from 'react';
// import { styled, useTheme } from '@mui/material/styles';

// import Components from '../../../components/muiComponents/components';
// import CustomIcons from '../../../components/common/icons/CustomIcons';
// import Button from '../../common/buttons/button';
// import { getReportHierarch } from '../../../service/contact/contactService';

// const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
//   '& .MuiDialogContent-root': { padding: theme.spacing(2) },
//   '& .MuiDialogActions-root': { padding: theme.spacing(1) },
// }));

// /** Person card */
// const OrgCard = ({ name = 'Unknown', title }) => {
//   const initials = name
//     .split(' ')
//     .filter(Boolean)
//     .map(p => p[0]?.toUpperCase())
//     .slice(0, 2)
//     .join('');

//   return (
//     <div className="relative w-[260px] max-w-[85vw] rounded-2xl border border-[#7413D133] bg-white/90 backdrop-blur shadow-sm p-4">
//       <div className="flex items-center gap-3">
//         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
//           {initials}
//         </div>
//         <div className="min-w-0 flex-1">
//           <div className="font-medium text-[#242424] truncate">{name}</div>
//           {title ? <div className="text-xs text-[#6b7280] truncate">{title}</div> : null}
//         </div>
//       </div>
//     </div>
//   );
// };

// /** Dotted background */
// const GridBack = ({ children }) => (
//   <div
//     className="relative min-h-[400px]"
//     style={{
//       backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
//       color: 'rgba(0,0,0,0.14)',
//       backgroundSize: '16px 16px',
//     }}
//   >
//     <div className="absolute inset-0 bg-white/70 pointer-events-none" />
//     <div className="relative h-full">{children}</div>
//   </div>
// );

// /** Recursive tree renderer (expects node.children as an array) */
// const TreeNode = ({ node, level = 0 }) => {
//   const hasChildren = Array.isArray(node.children) && node.children.length > 0;

//   return (
//     <div className="flex flex-col items-center relative">
//       {/* Node */}
//       <div className="relative">
//         <OrgCard name={node.name} title={node.title} />

//         {/* Arrow from parent */}
//         {level > 0 && (
//           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//             <div className="w-px h-4 bg-[#7413D1] opacity-50" />
//             <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
//               <CustomIcons iconName="fa-solid fa-caret-down" css="text-[#7413D1] w-4 h-4 opacity-50" />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Children */}
//       {hasChildren && (
//         <div className="relative mt-8">
//           {/* Vertical from parent */}
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-[#7413D1] opacity-30" />
//           <div className="relative flex justify-center">
//             {/* Horizontal connector */}
//             <div className="absolute top-8 left-0 right-0 h-px bg-[#7413D1] opacity-30" />
//             <div className="flex flex-wrap justify-center gap-8 relative pt-8">
//               {node.children.map((child) => (
//                 <div key={child.id} className="relative">
//                   {/* Up connector into child */}
//                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-[#7413D1] opacity-30" />
//                   <TreeNode node={child} level={level + 1} />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const OrgTreeView = ({ root }) => {
//   if (!root) {
//     return <div className="py-10 text-center text-sm text-gray-500">No hierarchy found.</div>;
//   }
//   return (
//     <div className="w-full flex justify-center">
//       <TreeNode node={root} />
//     </div>
//   );
// };

// /** Normalize API node: convert children:null -> [] and recurse */
// const normalizeTree = (node) => {
//   if (!node) return null;
//   const norm = {
//     id: node.id,
//     name: node.name,
//     title: node.title,
//     imageUrl: node.imageUrl,
//     children: Array.isArray(node.children)
//       ? node.children.map(normalizeTree).filter(Boolean)
//       : [], // children:null becomes []
//   };
//   return norm;
// };

// function ContactReportHierarch({ open, handleClose, contactId }) {
//   const theme = useTheme();
//   const [root, setRoot] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const onClose = () => handleClose();

//   useEffect(() => {
//     const handleGetData = async () => {
//       if (!open || !contactId) return;
//       try {
//         setLoading(true);
//         const res = await getReportHierarch(contactId);
//         const data = res?.result ?? res; // supports either shape
//         const tree = normalizeTree(data);
//         setRoot(tree);
//       } catch (e) {
//         console.error(e);
//         setRoot(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     handleGetData();
//   }, [open, contactId]);

//   return (
//     <>
//       <BootstrapDialog
//         open={open}
//         aria-labelledby="contact-hierarch-title"
//         fullWidth
//         maxWidth="md"
//         fullScreen={typeof window !== 'undefined' && window.innerWidth < 768}
//       >
//         <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="contact-hierarch-title">
//           Contact Report Hierarchy
//         </Components.DialogTitle>

//         <Components.IconButton
//           aria-label="close"
//           onClick={onClose}
//           sx={(theme) => ({
//             position: 'absolute',
//             right: 8,
//             top: 8,
//             color: theme.palette.primary.icon,
//           })}
//         >
//           <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black w-5 h-5" />
//         </Components.IconButton>

//         <Components.DialogContent dividers>
//           <div className="relative">
//             <div className="overflow-auto max-h-[70vh]">
//               <GridBack>
//                 <div className="min-w-[360px]">
//                   {loading ? (
//                     <div className="py-16 flex items-center justify-center text-gray-500">
//                       <CustomIcons iconName="fa-solid fa-spinner fa-spin" css="w-5 h-5 mr-2" />
//                       Loading organization chart…
//                     </div>
//                   ) : (
//                     <OrgTreeView root={root} />
//                   )}
//                 </div>
//               </GridBack>
//             </div>
//           </div>
//         </Components.DialogContent>

//         <Components.DialogActions>
//           <div className="flex justify-end items-center gap-4">
//             <Button type="button" text="Close" useFor="disabled" onClick={onClose} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
//           </div>
//         </Components.DialogActions>
//       </BootstrapDialog>
//     </>
//   );
// }

// export default ContactReportHierarch;
