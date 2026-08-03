import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#1d1a18",
          borderRadius: 18,
          color: "#f7f3ea",
          display: "flex",
          fontSize: 24,
          fontWeight: 800,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-1px",
          position: "relative",
          width: "100%",
        }}
      >
        FA
        <span
          style={{
            background: "#d9ff63",
            borderRadius: 999,
            bottom: 7,
            height: 7,
            position: "absolute",
            right: 7,
            width: 7,
          }}
        />
      </div>
    ),
    size,
  );
}
