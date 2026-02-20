"use client";

import React from "react";
import { type BuiltInProviderType } from "next-auth/providers/index";
import { signIn, type LiteralUnion } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { OAuthProviderButton } from "./oauth-provider-button";

export const SigninDialog = ({ children }: { children: React.ReactNode }) => {
  const [signinProvider, setSigninProvider] =
    React.useState<LiteralUnion<BuiltInProviderType>>();

  const handleSignin = async (provider: LiteralUnion<BuiltInProviderType>) => {
    setSigninProvider(provider);
    await signIn(provider);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[22rem] sm:max-w-sm">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Masuk</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <OAuthProviderButton
            provider="google"
            providerName="Google"
            isLoading={signinProvider === "google"}
            handleSignin={handleSignin}
            variant="default"
          />
          <OAuthProviderButton
            provider="github"
            providerName="GitHub"
            isLoading={signinProvider === "github"}
            handleSignin={handleSignin}
            variant="default"
          />
        </div>
        <DialogDescription className="text-center pt-4 border-t border-slate-200">
          Jika ada masalah login segera lapor melalui{" "}
          <a
            href="https://instagram.com/13bagas.exv"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:opacity-80 transition-opacity"
          >
            Instagram
          </a>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
