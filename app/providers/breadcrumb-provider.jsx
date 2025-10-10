"use client";
import { createContext, useContext, useReducer } from "react";

const BreadcrumbContext = createContext();

const initialState = {
  breadcrumb: [],
};

const breadcrumbReducer = (state, action) => {
  switch (action.type) {
    case "SET_BREADCRUMB":
      return { ...state, breadcrumb: action.payload };
  }
};

export const useBreadcrumb = () => {
  return useContext(BreadcrumbContext);
};

const BreadcrumbProvider = ({ children }) => {
  const [state, dispatch] = useReducer(breadcrumbReducer, initialState);

  return (
    <BreadcrumbContext.Provider value={{ state, dispatch }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export default BreadcrumbProvider;
