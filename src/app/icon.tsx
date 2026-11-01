import { ImageResponse } from "next/og";

// Favicon: a compact take on the Dodail roundel (public/logo.png) —
// white disc, orange ring, navy "d" with the orange dot. The full
// wordmark is illegible at 32px, so this keeps just the initial.
// Next.js renders this at build time and auto-injects <link rel="icon">.
// The full-size logo is served as the apple-touch icon (apple-icon.png).

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          border: "3px solid #F15A22",
          borderRadius: "50%",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1,
            color: "#0D1B2A",
            marginTop: -2,
          }}
        >
          d
        </div>
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 7,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#F15A22",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
