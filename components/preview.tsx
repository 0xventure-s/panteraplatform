"use client";

import { useEffect, useState } from "react";

import "react-quill/dist/quill.bubble.css";

interface PreviewProps {
  value: string;
}

const allowedTags = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
  "ul",
]);

const blockedTags = [
  "embed",
  "form",
  "iframe",
  "input",
  "math",
  "object",
  "script",
  "style",
  "svg",
  "template",
];

const allowedQuillClass = /^(ql-align-(center|right|justify)|ql-direction-rtl|ql-indent-[1-8]|ql-size-(small|large|huge))$/;

const isSafeUrl = (url: string) => {
  const normalizedUrl = url.trim();

  return (
    normalizedUrl.startsWith("/") ||
    normalizedUrl.startsWith("#") ||
    /^(https?:|mailto:|tel:)/i.test(normalizedUrl)
  );
};

const isSafeImageUrl = (url: string) => {
  return (
    isSafeUrl(url) ||
    /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=]+$/i.test(url.trim())
  );
};

const sanitizeRichText = (value: string) => {
  const document = new DOMParser().parseFromString(value, "text/html");

  document.querySelectorAll(blockedTags.join(",")).forEach((element) => {
    element.remove();
  });

  Array.from(document.body.querySelectorAll("*")).forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (!allowedTags.has(tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    const href = element.getAttribute("href");
    const imageSource = element.getAttribute("src");
    const imageAlt = element.getAttribute("alt");
    const className = element.getAttribute("class");

    Array.from(element.attributes).forEach((attribute) => {
      element.removeAttribute(attribute.name);
    });

    if (tagName === "a" && href && isSafeUrl(href)) {
      element.setAttribute("href", href.trim());
      element.setAttribute("rel", "noopener noreferrer");

      if (/^https?:/i.test(href.trim())) {
        element.setAttribute("target", "_blank");
      }
    }

    if (tagName === "img") {
      if (!imageSource || !isSafeImageUrl(imageSource)) {
        element.remove();
        return;
      }

      element.setAttribute("src", imageSource.trim());
      element.setAttribute("alt", imageAlt?.trim() || "");
      element.setAttribute("loading", "lazy");
    }

    if (className) {
      const safeClasses = className
        .split(/\s+/)
        .filter((classToken) => allowedQuillClass.test(classToken));

      if (safeClasses.length > 0) {
        element.setAttribute("class", safeClasses.join(" "));
      }
    }
  });

  return document.body.innerHTML;
};

export const Preview = ({ value }: PreviewProps) => {
  const [safeHtml, setSafeHtml] = useState("");

  useEffect(() => {
    setSafeHtml(sanitizeRichText(value));
  }, [value]);

  return (
    <div className="ql-container ql-bubble border-0">
      <div
        className="ql-editor p-0"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
};
