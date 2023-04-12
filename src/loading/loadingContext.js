import { createContext, useState } from "react";

export const LoadingContext = createContext("loading");

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [createImgSrc, setCreateImgSrc] = useState(null);
  const [createImgLatLng, setCreateImgLatLng] = useState(null);
  
  const values = { isLoading, setIsLoading };

  return (
    <LoadingContext.Provider value={values}>{children}</LoadingContext.Provider>
  );
}
