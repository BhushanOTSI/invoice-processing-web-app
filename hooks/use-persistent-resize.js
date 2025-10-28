import { useState, useEffect } from 'react';


export const usePersistentResize = (storageKey = 'panel-size') => {
  const [leftSize, setLeftSize] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setLeftSize(saved ? Number(saved) : undefined);
    setIsLoaded(true);
  }, [storageKey]);

  const savePanelSize = (sizes) => {
    const newSize = sizes[0];
    setLeftSize(newSize);
    localStorage.setItem(storageKey, newSize);
  };

  return {
    leftSize,
    isLoaded,
    savePanelSize
  };
};