import { useEffect, useCallback } from "react";

export const useScrollNavigation = (sections) => {
    const updateHashBasedOnScroll = useCallback(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        for (const section of sections) {
            if (section.id) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        // Special handling for hero section - clear the hash
                        if (section.id === 'hero') {
                            if (window.location.hash) {
                                history.replaceState(null, null, window.location.pathname);
                            }
                        } else {
                            const newHash = `#${section.id}`;
                            if (window.location.hash !== newHash) {
                                // Update URL hash without triggering scroll
                                history.replaceState(null, null, newHash);
                            }
                        }
                        break;
                    }
                }
            }
        }
    }, [sections]);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        // Hash navigation listener for manual clicks
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }
        };

        // Scroll listener to update hash based on visible section
        let scrollTimeout;
        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateHashBasedOnScroll, 100);
        };

        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Handle initial hash on load
        handleHashChange();

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [updateHashBasedOnScroll]);
};