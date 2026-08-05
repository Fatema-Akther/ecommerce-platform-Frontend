"use client";

import { useEffect, useSyncExternalStore } from "react";

type SidebarState = {
  isOpen: boolean;
  isDesktop: boolean;
};

let sidebarState: SidebarState = {
  isOpen: false,
  isDesktop: false,
};

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => sidebarState;

const setSidebarState = (partial: Partial<SidebarState>) => {
  sidebarState = { ...sidebarState, ...partial };
  emit();
};

const getIsDesktop = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768;
};

export const useSidebar = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    const updateViewport = () => {
      const desktop = getIsDesktop();
      setSidebarState({
        isDesktop: desktop,
        isOpen: desktop ? false : sidebarState.isOpen,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const openSidebar = () => setSidebarState({ isOpen: true });
  const closeSidebar = () => setSidebarState({ isOpen: false });
  const toggleSidebar = () => setSidebarState({ isOpen: !sidebarState.isOpen });
  const setIsOpen = (value: boolean) => setSidebarState({ isOpen: value });

  return {
    isOpen: state.isOpen,
    isDesktop: state.isDesktop,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setIsOpen,
  };
};