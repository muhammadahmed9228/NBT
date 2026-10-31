import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/apiClient";

const dismissKey = (announcement) =>
  `qala-announcement-dismissed:${announcement._id}:${announcement.updatedAt}`;

const isExternalLink = (link) => /^https?:\/\//i.test(link || "");

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient
      .get("/announcements/active")
      .then((response) => {
        if (!active) return;
        const data = response.data;
        setAnnouncement(data || null);
        if (data) {
          try {
            setDismissed(sessionStorage.getItem(dismissKey(data)) === "true");
          } catch {
            setDismissed(false);
          }
        }
      })
      .catch(() => {
        if (active) setAnnouncement(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!announcement?.message || dismissed) return null;

  const link = announcement.link?.trim();

  return (
    <div
      className="relative z-[61] flex min-h-9 items-center justify-center px-8 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] sm:px-12 sm:text-[11px]"
      style={{ backgroundColor: announcement.backgroundColor || "#30251E", color: announcement.textColor || "#D8C8B6" }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-center">
        {link ? (
          isExternalLink(link) ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block leading-snug underline-offset-4 hover:underline"
            >
              {announcement.message}
            </a>
          ) : (
            <Link
              to={link}
              className="inline-block leading-snug underline-offset-4 hover:underline"
            >
              {announcement.message}
            </Link>
          )
        ) : (
          <span className="inline-block leading-snug">{announcement.message}</span>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          try {
            sessionStorage.setItem(dismissKey(announcement), "true");
          } catch {
            // Ignore storage failures in private browsing.
          }
          setDismissed(true);
        }}
        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-base leading-none opacity-75 transition hover:opacity-100 sm:right-3"
      >
        &times;
      </button>
    </div>
  );
}
