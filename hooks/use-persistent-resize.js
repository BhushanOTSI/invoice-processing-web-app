import { useState, useEffect } from 'react';


export const usePersistentResize = (storageKey = 'panel-size', recordId = null) => {
  const [leftSize, setLeftSize] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const recordKey = recordId ? `${storageKey}-${recordId}` : storageKey;
    const saved = sessionStorage.getItem(recordKey);
    setLeftSize(saved ? Number(saved) : 45);
    setIsLoaded(true);
    
    return () => sessionStorage.removeItem(recordKey);
  }, [storageKey, recordId]);

  const savePanelSize = (sizes) => {
    const newSize = sizes[0];
    setLeftSize(newSize);
    const recordKey = recordId ? `${storageKey}-${recordId}` : storageKey;
    sessionStorage.setItem(recordKey, newSize);
  };

  return {
    leftSize,
    isLoaded,
    savePanelSize
  };
};