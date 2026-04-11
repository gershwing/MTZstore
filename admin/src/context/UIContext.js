// admin/src/context/UIContext.js
import React from "react";
const UIContext = React.createContext(null);
export default UIContext;
export function useUI() { return React.useContext(UIContext); }
export const UIProvider = UIContext.Provider;
