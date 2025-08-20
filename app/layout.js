import "./globals.css";
import React from "react";

export const metadata = {
  title: "Movies List",
  description: "Track and rate your watched movies 🍿",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
