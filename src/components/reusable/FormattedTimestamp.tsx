"use client";

import React from "react";

export interface FormattedTimestampProps {
  value: string | number | Date;
  fallback?: string;
  className?: string;
}

export function formatDateTimeParts(value: string | number | Date) {
  if (!value) return { date: "-", time: "" };

  const d = new Date(value);
  if (isNaN(d.getTime())) {
    // If it is a string like "2026-10-24 21:40:12 UTC"
    const str = String(value);
    const parts = str.split(" ");
    if (parts.length >= 2) {
      return { date: parts[0], time: parts.slice(1).join(" ") };
    }
    return { date: str, time: "" };
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const date = `${day} ${month} ${year}`;

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const time = `${hours}:${minutes}:${seconds} ${ampm}`;

  return { date, time };
}

export function FormattedTimestamp({ value, fallback = "-", className = "" }: FormattedTimestampProps) {
  if (!value) {
    return <span className="text-xs text-slate-400 font-mono">{fallback}</span>;
  }

  const { date, time } = formatDateTimeParts(value);

  return (
    <div className={`flex flex-col whitespace-nowrap ${className}`}>
      <span className="text-xs font-semibold text-slate-900 dark:text-white">{date}</span>
      {time && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{time}</span>
      )}
    </div>
  );
}

export default FormattedTimestamp;
