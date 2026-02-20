"use client";

import { Button } from "~/components/ui/button";
import { Icons, iconVariants } from "~/components/ui/icons";
import Link from "next/link";

export const HeaderActions = () => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground transition-colors hover:text-foreground"
        asChild
      >
        <Link href="https://instagram.com/13bagas.exv" target="_blank">
          <Icons.Instagram className={iconVariants({ size: "lg" })} />
          <span className="sr-only">Instagram</span>
        </Link>
      </Button>
    </div>
  );
};
