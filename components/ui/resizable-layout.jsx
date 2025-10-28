import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { usePersistentResize } from "@/hooks/use-persistent-resize";

/**
 * Super simple resizable layout - just pass left and right content!
 */
export const ResizableLayout = ({
    storageKey,
    leftPanel,
    rightPanel,
    className = "h-full overflow-hidden"
}) => {
    const { leftSize, isLoaded, savePanelSize } = usePersistentResize(storageKey);

    if (!isLoaded) {
        return null;
    }

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className={className}
            onLayout={savePanelSize}
        >
            <ResizablePanel defaultSize={leftSize}>
                {leftPanel}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
                {rightPanel}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};