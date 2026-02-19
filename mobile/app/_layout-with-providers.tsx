/**
 * This file is now DEPRECATED.
 * Please use _layout.tsx instead.
 * This file exists only for reference and will be removed in a future update.
 */
import React from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { store } from "../store";
import { Slot } from "expo-router";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </Provider>
  );
}
