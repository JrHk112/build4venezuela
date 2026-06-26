import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/whatsapp",
        destination:
          "https://chat.whatsapp.com/JH4oq2pmeX43EWXkvRhQHC?mode=gi_t",
        permanent: false,
      },
      {
        source: "/wpp",
        destination:
          "https://chat.whatsapp.com/JH4oq2pmeX43EWXkvRhQHC?mode=gi_t",
        permanent: false,
      },
      {
        source: "/luma",
        destination: "https://luma.com/hack0-zrbp",
        permanent: false,
      },
      {
        source: "/event",
        destination: "https://luma.com/hack0-zrbp",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
