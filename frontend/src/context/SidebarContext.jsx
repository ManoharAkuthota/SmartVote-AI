import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  // Mobile drawer open/close
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Desktop sidebar collapsed state (compact w-20 vs expanded w-64)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('smartvote_sidebar_collapsed') === 'true';
  });

  // Desktop sidebar visibility toggle (show/hide sidebar completely on desktop if desired)
  const [isDesktopVisible, setIsDesktopVisible] = useState(() => {
    const saved = localStorage.getItem('smartvote_sidebar_visible');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('smartvote_sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('smartvote_sidebar_visible', isDesktopVisible);
  }, [isDesktopVisible]);

  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const toggleDesktopSidebar = () => setIsDesktopVisible((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        isCollapsed,
        toggleCollapse,
        isDesktopVisible,
        toggleDesktopSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
