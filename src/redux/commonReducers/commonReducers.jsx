import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  alert: { open: false, message: '', type: '' },
  uploadedFiles: [],
  userDetails: null,
  userPermissions: null,
  title: null,
  sessionEndModel: false,
  syncCount: null,
  syncingPullStatus: false,
  syncingPushStatus: false,

  // Sidebar states (moved from context)
  isExpanded: true,
  isMobileOpen: false,
  isMobile: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,
};

const commonReducersSlice = createSlice({
  name: "commonReducers",
  initialState,
  reducers: {
    setSessionEndModel(state, action) {
      state.sessionEndModel = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setAlert(state, action) {
      state.alert = action.payload;
    },
    setUploadedFiles(state, action) {
      state.uploadedFiles = action.payload;
    },
    handleDrawerClose(state) {
      state.drawerOpen = false;
    },
    handleSetTitle(state, action) {
      state.title = action.payload;
    },
    handleSetUserDetails(state, action) {
      state.userDetails = action.payload;
    },
    handleSetUserPermissions(state, action) {
      state.userPermissions = action.payload;
    },
    handleToogleSettingDrawer(state) {
      if (state.openSettingDrawer) {
        state.openSettingDrawer = false;
        state.settingDrawerWidth = 0;
      } else {
        state.openSettingDrawer = true;
        state.settingDrawerWidth = 350;
      }
    },
    setSyncCount(state, action) {
      state.syncCount = action.payload;
    },
    setSyncingPullStatus(state, action) {
      state.syncingPullStatus = action.payload;
    },
    setSyncingPushStatus(state, action) {
      state.syncingPushStatus = action.payload;
    },

    // Sidebar reducers
    toggleSidebar(state) {
      state.isExpanded = !state.isExpanded;
    },
    toggleMobileSidebar(state) {
      state.isMobileOpen = !state.isMobileOpen;
    },
    setIsHovered(state, action) {
      state.isHovered = action.payload;
    },
    setActiveItem(state, action) {
      state.activeItem = action.payload;
    },
    toggleSubmenu(state, action) {
      state.openSubmenu = state.openSubmenu === action.payload ? null : action.payload;
    },
    setIsMobile(state, action) {
      state.isMobile = action.payload;
      if (!action.payload) {
        state.isMobileOpen = false;
      }
    },
    setOpenSubmenu(state, action) {
      state.openSubmenu = action.payload;
    }
  },
});

export const {
  setLoading,
  setAlert,
  setUploadedFiles,
  handleSetTitle,
  handleSetUserDetails,
  handleSetUserPermissions,
  setSessionEndModel,
  setSyncCount,
  setSyncingPullStatus,
  setSyncingPushStatus,
  
  // Sidebar actions
  toggleSidebar,
  toggleMobileSidebar,
  setIsHovered,
  setActiveItem,
  toggleSubmenu,
  setIsMobile,
  setOpenSubmenu,
} = commonReducersSlice.actions;

export default commonReducersSlice.reducer;
