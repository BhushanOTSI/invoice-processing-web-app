import { NavTop } from "./nav-top";
import { ScrollArea } from "./scroll-area";

export function AppFullLayout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      <NavTop />

      <main className="flex-1 overflow-auto">
        <ScrollArea className="h-full px-6 py-6">{children}</ScrollArea>
      </main>
    </div>
  );
}
