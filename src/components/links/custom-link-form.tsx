"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkSlug,
  createShortLink,
  editShortLink,
} from "~/server/actions/link";
import { type ShortLink } from "~/server/db/schema";
import { type SafeActionError } from "~/types";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { nanoid, setFormErrors } from "~/lib/utils";
import { insertLinkSchema } from "~/lib/validations/link";
import { useDebounce } from "~/hooks/use-debounce";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Icons, iconVariants } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { Textarea } from "~/components/ui/textarea";
import { LinkNotification } from "~/components/links/link-notification";

const formSchema = insertLinkSchema;

type FormSchema = z.infer<typeof formSchema>;

type CustomLinkFormProps = (
  | {
      isEditing: boolean;
      defaultValues?: ShortLink;
    }
  | {
      isEditing?: undefined;
      defaultValues?: undefined;
    }
) & {
  onSetIsDialogOpen: (value: boolean) => void;
};

export const CustomLinkForm = ({
  onSetIsDialogOpen,
  isEditing = false,
  defaultValues,
}: CustomLinkFormProps) => {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [isSlugExist, setIsSlugExist] = useState(false);
  const [notificationSlug, setNotificationSlug] = useState<string | null>(null);
  const debouncedSlug = useDebounce(slug, 500);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: defaultValues?.url ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  const handleCreateSuccess = (data?: { slug?: string }) => {
    toast.success("Link berhasil dibuat");
    onSetIsDialogOpen(false);
    form.reset();
    // Show notification dengan slug yang baru dibuat
    if (data?.slug) {
      setNotificationSlug(data.slug);
    }
    // Refresh untuk memastikan UI ter-update dengan data terbaru
    router.refresh();
  };

  const handleEditSuccess = () => {
    toast.success("Link berhasil diubah");
    onSetIsDialogOpen(false);
    form.reset();
    // Refresh untuk memastikan UI ter-update dengan data terbaru
    router.refresh();
  };

  const handleError = (error: SafeActionError) => {
    if (error.validationErrors) {
      return setFormErrors(form, error.validationErrors);
    }
    const errorMessage = error.serverError ?? error.fetchError ?? "Aksi gagal";
    toast.error(errorMessage);
    console.error("Action error:", error);
  };

  const { execute: createLink, status: createLinkStatus } = useAction(
    createShortLink,
    { onSuccess: handleCreateSuccess, onError: handleError },
  );

  const { execute: editLink, status: editLinkStatus } = useAction(
    editShortLink,
    { onSuccess: handleEditSuccess, onError: handleError },
  );

  const { execute: checkSlugExists, status: checkSlugExistsStatus } = useAction(
    checkSlug,
    {
      onError: handleError,
      onSuccess: (slugExist) => {
        if (slugExist) {
          setIsSlugExist(true);
          form.setError("slug", { message: "Slug sudah ada" });
        } else {
          setIsSlugExist(false);
          form.clearErrors("slug");
        }
      },
    },
  );

  useEffect(() => {
    setIsSlugExist(false);

    if (!debouncedSlug) {
      return form.clearErrors("slug");
    }

    checkSlugExists({ slug: debouncedSlug });
  }, [debouncedSlug]);

  const onSubmit = (values: FormSchema) => {
    if (isSlugExist) {
      return form.setError("slug", { message: "Slug sudah ada" });
    }

    if (isEditing) {
      editLink({ slug: defaultValues?.slug ?? "", newLink: values });
    } else {
      createLink(values);
    }
  };

  const isExecuting =
    createLinkStatus === "executing" || editLinkStatus === "executing";
  const isCheckingSlug = checkSlugExistsStatus === "executing";

  return (
    <>
      <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-4"
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Tujuan</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/mehrabmp/cut-it"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex w-full items-center justify-between">
                <div>Link Pendek (opsional)</div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center text-xs py-0 px-0 hover:bg-background h-auto"
                  onClick={() => {
                    const newSlug = nanoid();
                    form.setValue("slug", newSlug);
                    setSlug(newSlug);
                  }}
                >
                  <Icons.Shuffle
                    className={iconVariants({
                      size: "xs",
                      className: "mr-1",
                    })}
                  />
                  Acak
                </Button>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="github"
                    className="pe-8"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setSlug(e.target.value);
                    }}
                  />
                  {isCheckingSlug && (
                    <div className="absolute end-3 top-1/2 -translate-y-1/2 transform text-muted-foreground">
                      <Loader />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Slinku adalah alat open source gratis untuk membuat link pendek"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!form.formState.isDirty}
          isLoading={isExecuting}
        >
          {isEditing
            ? isExecuting
              ? "Menyimpan perubahan..."
              : "Simpan perubahan"
            : isExecuting
              ? "Membuat link..."
              : "Buat link"}
        </Button>
      </form>
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
