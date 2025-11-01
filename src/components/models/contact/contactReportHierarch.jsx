import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';

import Components from '../../../components/muiComponents/components';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Button from '../../common/buttons/button';
import { getReportHierarch } from '../../../service/contact/contactService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

/** Person card */
const OrgCard = ({ name = 'Unknown', title }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="relative w-[260px] max-w-[85vw] rounded-2xl border border-[#7413D133] bg-white/90 backdrop-blur shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[#242424] truncate">{name}</div>
          {title ? <div className="text-xs text-[#6b7280] truncate">{title}</div> : null}
        </div>
      </div>
    </div>
  );
};

/** Dotted background */
const GridBack = ({ children }) => (
  <div
    className="relative min-h-[400px]"
    style={{
      backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
      color: 'rgba(0,0,0,0.14)',
      backgroundSize: '16px 16px',
    }}
  >
    <div className="absolute inset-0 bg-white/70 pointer-events-none" />
    <div className="relative h-full">{children}</div>
  </div>
);

/** Recursive tree renderer (expects node.children as an array) */
const TreeNode = ({ node, level = 0 }) => {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <div className="flex flex-col items-center relative">
      {/* Node */}
      <div className="relative">
        <OrgCard name={node.name} title={node.title} />

        {/* Arrow from parent */}
        {level > 0 && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-px h-4 bg-[#7413D1] opacity-50" />
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <CustomIcons iconName="fa-solid fa-caret-down" css="text-[#7413D1] w-4 h-4 opacity-50" />
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && (
        <div className="relative mt-8">
          {/* Vertical from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-[#7413D1] opacity-30" />
          <div className="relative flex justify-center">
            {/* Horizontal connector */}
            <div className="absolute top-8 left-0 right-0 h-px bg-[#7413D1] opacity-30" />
            <div className="flex flex-wrap justify-center gap-8 relative pt-8">
              {node.children.map((child) => (
                <div key={child.id} className="relative">
                  {/* Up connector into child */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-[#7413D1] opacity-30" />
                  <TreeNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrgTreeView = ({ root }) => {
  if (!root) {
    return <div className="py-10 text-center text-sm text-gray-500">No hierarchy found.</div>;
  }
  return (
    <div className="w-full flex justify-center">
      <TreeNode node={root} />
    </div>
  );
};

/** Normalize API node: convert children:null -> [] and recurse */
const normalizeTree = (node) => {
  if (!node) return null;
  const norm = {
    id: node.id,
    name: node.name,
    title: node.title,
    imageUrl: node.imageUrl,
    children: Array.isArray(node.children)
      ? node.children.map(normalizeTree).filter(Boolean)
      : [], // children:null becomes []
  };
  return norm;
};

function ContactReportHierarch({ open, handleClose, contactId }) {
  const theme = useTheme();
  const [root, setRoot] = useState(null);
  const [loading, setLoading] = useState(false);

  const onClose = () => handleClose();

  useEffect(() => {
    const handleGetData = async () => {
      if (!open || !contactId) return;
      try {
        setLoading(true);
        const res = await getReportHierarch(contactId);
        const data = res?.result ?? res; // supports either shape
        const tree = normalizeTree(data);
        setRoot(tree);
      } catch (e) {
        console.error(e);
        setRoot(null);
      } finally {
        setLoading(false);
      }
    };
    handleGetData();
  }, [open, contactId]);

  return (
    <>
      <BootstrapDialog
        open={open}
        aria-labelledby="contact-hierarch-title"
        fullWidth
        maxWidth="lg"
        fullScreen={typeof window !== 'undefined' && window.innerWidth < 768}
      >
        <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="contact-hierarch-title">
          Contact Report Hierarchy
        </Components.DialogTitle>

        <Components.IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.primary.icon,
          })}
        >
          <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black w-5 h-5" />
        </Components.IconButton>

        <Components.DialogContent dividers>
          <div className="relative">
            <div className="overflow-auto max-h-[70vh]">
              <GridBack>
                <div className="min-w-[360px]">
                  {loading ? (
                    <div className="py-16 flex items-center justify-center text-gray-500">
                      <CustomIcons iconName="fa-solid fa-spinner fa-spin" css="w-5 h-5 mr-2" />
                      Loading organization chart…
                    </div>
                  ) : (
                    <OrgTreeView root={root} />
                  )}
                </div>
              </GridBack>
            </div>
          </div>
        </Components.DialogContent>

        <Components.DialogActions>
          <div className="flex justify-end items-center gap-4">
            <Button type="button" text="Close" useFor="disabled" onClick={onClose} />
          </div>
        </Components.DialogActions>
      </BootstrapDialog>
    </>
  );
}

export default ContactReportHierarch;
