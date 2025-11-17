import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AlphaTag() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <sup>(Alpha)</sup>
      </TooltipTrigger>
      <TooltipContent className="max-w-60">
        We&apos;re dedicated to delivering a seamless experience for our users.
        <br />
        <br />
        This feature is currently in its alpha stage and available to a limited
        group. We&apos;re actively working to make it accessible to everyone
        soon.
      </TooltipContent>
    </Tooltip>
  );
}
