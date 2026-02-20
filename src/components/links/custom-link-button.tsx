"use client";

import * as React from "react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Icons, iconVariants } from "~/components/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const CustomLinkButton = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ className, disabled, ...props }, ref) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn({ "cursor-not-allowed": disabled })}>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className={cn(className)}
            disabled={disabled}
            ref={ref}
            {...props}
          >
            <Icons.Settings2 className={iconVariants({ size: "lg" })} />
            <span className="sr-only">Buat link custom</span>
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {disabled ? "Masuk untuk buat link custom" : "Buat link custom"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
});
CustomLinkButton.displayName = "CustomLinkButton";

export { CustomLinkButton };
