import { useState, useEffect } from 'react';


export const usePersistentResize = (storageKey = 'panel-size', recordId = null) => {
  const [leftSize, setLeftSize] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

  const recordKey = recordId ? `${storageKey}-${recordId}` : storageKey;

  useEffect(() => {
    const saved = sessionStorage.getItem(recordKey);
    setLeftSize(saved ? Number(saved) : 45);
    setIsLoaded(true);
    
    return () => sessionStorage.removeItem(recordKey);
  }, [recordKey]);

  const savePanelSize = (sizes) => {
    const newSize = sizes[0];
    setLeftSize(newSize);
    sessionStorage.setItem(recordKey, newSize);
  };

  return {
    leftSize,
    isLoaded,
    savePanelSize
  };
};