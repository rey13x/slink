"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createShortLink } from "~/server/actions/link";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { setFormErrors } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Icons, iconVariants } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { LinkNotification } from "~/components/links/link-notification";

const formSchema = z.object({
  url: z.string().url(),
});

type FormSchema = z.infer<typeof formSchema>;

type LinkFormProps = {
  renderCustomLink: React.ReactNode;
};

export const LinkForm = ({ renderCustomLink }: LinkFormProps) => {
  const router = useRouter();
  const [notificationSlug, setNotificationSlug] = useState<string | null>(null);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const { execute: createLink, status: createLinkStatus } = useAction(
    createShortLink,
    {
      onSuccess(data) {
        toast.success("Link berhasil dibuat");
        form.reset();
        // Show notification dengan slug yang baru dibuat
        if (data?.slug) {
          setNotificationSlug(data.slug);
        }
        // Refresh untuk memastikan UI ter-update dengan data terbaru
        router.refresh();
      },
      onError(error: { validationErrors?: Record<string, string[]>; serverError?: string; fetchError?: string }) {
        if (error.validationErrors) {
          return setFormErrors(form, error.validationErrors);
        }
        const errorMessage =
          error.serverError ?? error.fetchError ?? "Gagal membuat link";
        toast.error(errorMessage);
        console.error("Create link error:", error);
      },
    },
  );

  const onSubmit = (values: FormSchema) => {
    createLink({ url: values.url, slug: "" });
  };

  return (
    <>
      <Form {...form}>
        <div className="flex gap-2 w-full">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full justify-center gap-2"
          >
            <div className="flex-1">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter the link here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button size="icon" isLoading={createLinkStatus === "executing"}>
              <Icons.Scissors className={iconVariants({ size: "lg" })} />
              <span className="sr-only">Create short link</span>
            </Button>
          </form>
          {renderCustomLink}
        </div>
      </Form>
      {notificationSlug && (
        <LinkNotification
          slug={notificationSlug}
          onClose={() => setNotificationSlug(null)}
        />
      )}
    </>
  );
};
