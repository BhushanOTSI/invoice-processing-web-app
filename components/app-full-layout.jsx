import { NavTop } from "./nav-top";
import { ScrollArea } from "./scroll-area";
import { OfflineMessage } from "./offline-message";

export function AppFullLayout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <NavTop />

      <main className="flex-1 overflow-auto">
        <ScrollArea className="h-full px-8 py-8">
          <OfflineMessage>{children}</OfflineMessage>
        </ScrollArea>
      </main>
    </div>
  );
}
