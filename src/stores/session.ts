// "use client";

// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";

// export type SessionUser = {
//   id: string;
//   email: string;
//   fullName?: string;
//   role?: string;
// };

// type SessionState = {
//   accessToken: string | null;
//   user: SessionUser | null;
//   order: any | null;

//   hydrated: boolean;
//   isLoading: boolean;

//   setAccessToken: (token: string | null) => void;
//   setUser: (user: SessionUser | null) => void;
//   setOrder: (order: any | null) => void;

//   logout: () => void;
//   clearSession: () => void;

//   setHydrated: (value: boolean) => void;
//   setIsLoading: (loading: boolean) => void;
// };

// export const useSessionStore = create<SessionState>()(
//   persist(
//     (set) => ({
//       accessToken: null,
//       user: null,
//       order: null,

//       hydrated: false,
//       isLoading: true,

//       setAccessToken: (token) => set({ accessToken: token }),
//       setUser: (user) => set({ user }),
//       setOrder: (order) => set({ order }),

//       // ✅ silent clear (401, token expired)
//       clearSession: () => {
//         set({
//           accessToken: null,
//           user: null,
//           order: null,
//         });

//         if (typeof window !== "undefined") {
//           localStorage.removeItem("session-storage");
//         }
//       },

//       // ✅ user-triggered logout
//       logout: () => {
//         set({
//           accessToken: null,
//           user: null,
//           order: null,
//           hydrated: false,
//           isLoading: false,
//         });

//         if (typeof window !== "undefined") {
//           localStorage.removeItem("session-storage");
//           window.location.href = "/login"; // keep history
//         }
//       },

//       setHydrated: (value) => set({ hydrated: value }),
//       setIsLoading: (loading) => set({ isLoading: loading }),
//     }),
//     {
//       name: "session-storage",
//       storage: createJSONStorage(() => localStorage),

//       partialize: (state) => ({
//         accessToken: state.accessToken,
//         user: state.user,
//         order: state.order,
//       }),

//       onRehydrateStorage: () => (state) => {
//         state?.setHydrated(true);
//         state?.setIsLoading(false);
//       },
//     }
//   )
// );








"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SessionUser = {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
};

type SessionState = {
  accessToken: string | null;
  user: SessionUser | null;
  hydrated: boolean;
  order: any | null;
  isLoading: boolean;  // Add loading state
  setAccessToken: (token: string | null) => void;
  setUser: (user: SessionUser | null) => void;
  setOrder: (order: any | null) => void;
  clearSession: () => void;
   logout: () => void; // ✅ ADD THIS
  setHydrated: (value: boolean) => void;
  setIsLoading: (loading: boolean) => void; // Add function to set loading state
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      hydrated: false,
      order: null,
      isLoading: true,  // Initially set to true when session is loading
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }), // Ensure user role is included here
      setOrder: (order) => set({ order }),
      clearSession: () =>
        set({
          accessToken: null,
          user: null,
          order: null,
        }),



        logout: () => {
  set({
    accessToken: null,
    user: null,
    order: null,
    hydrated: false,
    isLoading: false,
  });

  if (typeof window !== "undefined") {
    localStorage.removeItem("session-storage");

    sessionStorage.setItem("afterLogoutRedirect", "/");

    window.location.href = "/login"; // FULL RESET
  }
},
        
      setHydrated: (value) => set({ hydrated: value }),
      setIsLoading: (loading) => set({ isLoading: loading }),  // Manage loading state
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
  accessToken: state.accessToken,
  user: state.user,
  order: state.order,
}),

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        state?.setIsLoading(false);  // Set loading to false once session is hydrated
      },
    }
  )
);











