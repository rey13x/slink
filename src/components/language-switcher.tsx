"use client";

import { useLanguage, type Language } from "~/lib/i18n/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";

const languages: { code: Language; label: string }[] = [
  { code: "id", label: "🇮🇩 ID" },
  { code: "en", label: "🇬🇧 ENG" },
  { code: "zh", label: "🇨🇳 CHN" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {currentLanguage?.label ?? "ID"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="cursor-pointer"
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
