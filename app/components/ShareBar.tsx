"use client";

import { useEffect, useState } from "react";
import { useLang } from "../LangProvider";
import { IconFacebook, IconWhatsApp } from "./icons";

interface ShareBarProps {
  /** Chemin de la page, ex. /resources/mon-article. */
  path: string;
  title: string;
  /** Accroche envoyée avec le lien sur WhatsApp. */
  shareText: string;
}

// WhatsApp d'abord : c'est là que les étudiants francophones se partagent les liens.
export default function ShareBar({ path, title, shareText }: ShareBarProps) {
  const { t, lang } = useLang();
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + path);
    setCanNativeShare(typeof navigator.share === "function");
  }, [path]);

  const enc = encodeURIComponent;
  const links = [
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { id: "x", label: "X", href: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}` },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(shareText)}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers refusé : le lien reste visible dans la barre d'adresse.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      // Partage annulé par l'utilisateur.
    }
  }

  return (
    <div className="share-bar">
      <p className="share-bar-title">{t.resources.shareTitle}</p>
      <div className="share-bar-actions">
        <a
          className="btn btn-whatsapp"
          href={`https://wa.me/?text=${enc(`${shareText}\n${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconWhatsApp /> {t.resources.shareWhatsApp}
        </a>
        {links.map((l) => (
          <a key={l.id} className="share-chip" href={l.href} target="_blank" rel="noopener noreferrer">
            {l.id === "facebook" ? <IconFacebook className="share-chip-icon" /> : null}
            {l.label}
          </a>
        ))}
        <button type="button" className="share-chip" onClick={copy}>
          {copied ? t.resources.linkCopied : t.resources.copyLink}
        </button>
        {canNativeShare ? (
          <button
            type="button"
            className="share-chip"
            onClick={nativeShare}
            aria-label={lang === "fr" ? "Plus d'options de partage" : "More sharing options"}
          >
            •••
          </button>
        ) : null}
      </div>
    </div>
  );
}
