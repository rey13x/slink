/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  checkSlugExists,
  deleteLinkAndRevalidate,
  generateShortLink,
  updateLinkBySlug,
} from "~/server/api/link";
import {
  createNewUserLink,
  getOrCreateUserLinkById,
  getOrCreateUserLinkByUserId,
  getUserLinkByUserId,
  setUserLinkIdCookie,
} from "~/server/api/user-link";
import { type UserLink } from "~/server/db/schema";
import { z } from "zod";

import { action, authAction, MyCustomError } from "~/lib/safe-action";
import { editLinkSchema, insertLinkSchema } from "~/lib/validations/link";

import { getServerAuthSession } from "../auth";
import { redis } from "../redis";

export const createShortLink = action(
  insertLinkSchema,
  async ({ url, slug, description }) => {
    try {
      const session = await getServerAuthSession();
      let generatedSlug: string;

      if (session) {
        const userLink = await getOrCreateUserLinkByUserId(session.user.id);

        generatedSlug = await generateShortLink({
          userLinkId: userLink.id,
          slug,
          url,
          description,
        });
      } else {
        const cookieStore = cookies();
        const userLinkId = cookieStore.get("user-link-id")?.value;
        let userLink: UserLink | undefined;

        if (!userLinkId) {
          userLink = await createNewUserLink();
        } else {
          userLink = await getOrCreateUserLinkById(userLinkId);
        }

        if (!userLink) {
          throw new MyCustomError("Error in creating user link");
        }

        if (userLink.id !== userLinkId) {
          setUserLinkIdCookie(userLink.id);
        }

        generatedSlug = await generateShortLink({
          url,
          userLinkId: userLink.id,
          isGuestUser: true,
          slug: "",
        });
      }

      revalidatePath("/");
      return { message: "Link creation successful", slug: generatedSlug };
    } catch (err: unknown) {
      const error = err instanceof MyCustomError ? err : null;
      if (error) {
        throw error;
      }
      console.error("[createShortLink] Error:", err);
      throw new MyCustomError("Failed to create link. Please try again.");
    }
  },
);

export const deleteShortLink = action(
  z.object({ slug: z.string() }),
  async ({ slug }) => {
    try {
      const cookieStore = cookies();
      const userLinkIdCookie = cookieStore.get("user-link-id")?.value;

      if (userLinkIdCookie) {
        return await deleteLinkAndRevalidate(slug, userLinkIdCookie);
      }

      const session = await getServerAuthSession();
      if (!session) {
        throw new MyCustomError("Session not found!");
      }

      const userLink = await getUserLinkByUserId(session.user.id);
      if (!userLink) {
        throw new MyCustomError("No user link found");
      }

      return await deleteLinkAndRevalidate(slug, userLink.id);
    } catch (err: unknown) {
      const error = err instanceof MyCustomError ? err : null;
      if (error) {
        throw error;
      }
      console.error("[deleteShortLink] Error:", err);
      throw new MyCustomError("Failed to delete link. Please try again.");
    }
  },
);

export const editShortLink = authAction(
  editLinkSchema,
  async ({ slug, newLink }, { user }) => {
    try {
      const newUrl = encodeURIComponent(newLink.url);
      const newSlug = newLink.slug;

      const userLink = await getUserLinkByUserId(user.id);
      if (!userLink) {
        throw new MyCustomError("No user link found");
      }

      const link = userLink.links.find((link) => link.slug === slug);
      if (!link) {
        throw new MyCustomError("Link not found");
      }

      // Update database terlebih dahulu (prioritas)
      if (newSlug !== slug) {
        const slugExists = await checkSlugExists(newSlug);
        if (slugExists) {
          throw new MyCustomError("Slug already exists");
        }

        await updateLinkBySlug(slug, { ...newLink, url: newUrl });
      } else {
        await updateLinkBySlug(slug, {
          ...newLink,
          url: newUrl,
          slug: slug,
        });
      }

      // Redis operations (non-critical)
      try {
        if (newSlug !== slug) {
          await Promise.all([
            redis.del(slug.toLowerCase()),
            redis.set(newSlug.toLowerCase(), newUrl),
          ]);
        } else {
          if (newUrl !== link.url) {
            await redis.set(slug.toLowerCase(), newUrl);
          }
        }
      } catch (redisErr: unknown) {
        console.error("[@editShortLink] Redis operation failed:", redisErr);
        // Continue anyway karena database sudah terupdate
      }

      revalidatePath("/");
      return { message: "Link edited successfully" };
    } catch (err: unknown) {
      const error = err instanceof MyCustomError ? err : null;
      if (error) {
        throw error;
      }
      console.error("[editShortLink] Error:", err);
      throw new MyCustomError("Failed to edit link. Please try again.");
    }
  },
);

export const checkSlug = authAction(
  insertLinkSchema.pick({ slug: true }),
  async ({ slug }) => {
    return await checkSlugExists(slug);
  },
);
