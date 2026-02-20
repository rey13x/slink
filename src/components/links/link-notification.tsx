"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { id } from "date-fns/locale";
import { getBaseUrl } from "~/lib/utils";

type LinkNotificationProps = {
  slug: string;
  onClose?: () => void;
  autoCloseDuration?: number;
};

export const LinkNotification = ({
  slug,
  onClose,
  autoCloseDuration = 3000,
}: LinkNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const shortenedURL = `${getBaseUrl()}/${slug}`;
  const createdAt = new Date();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300); // Duration of fade out animation
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isExiting
          ? "opacity-0 translate-y-4"
          : "opacity-100 translate-y-0 animate-in slide-in-from-bottom"
      }`}
      style={{
        animation: !isExiting
          ? "slideInUp 0.3s ease-out forwards"
          : "slideOutDown 0.3s ease-in forwards",
      }}
    >
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>

      <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden max-w-sm w-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900 text-sm">
            Bagas
          </h3>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-slate-700 text-sm">
            Shorter Link menjadi{" "}
            <span className="font-semibold text-blue-600 break-all">
              {shortenedURL}
            </span>
          </p>

          {/* Timestamp */}
          <p className="text-xs text-slate-500 mt-2">
            {formatDistanceToNowStrict(createdAt, {
              addSuffix: true,
              locale: id,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
