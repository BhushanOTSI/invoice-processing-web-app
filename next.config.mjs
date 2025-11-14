/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const s3BucketUrl =
      process.env.NEXT_PUBLIC_S3_BUCKET_URL ||
      "https://ibm-invoice-processing-pdf.s3.ap-south-1.amazonaws.com";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const allowedSources = [
      "'self'",
      "data:",
      "blob:",
      "https:",
      s3BucketUrl,
      ...(apiUrl ? [apiUrl] : []),
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `img-src ${allowedSources}`,
              `connect-src 'self' https: wss: ${s3BucketUrl}${
                apiUrl ? ` ${apiUrl}` : ""
              }`,
              `media-src ${allowedSources}`,
              `object-src 'self' ${s3BucketUrl}`,
              `frame-src 'self' ${s3BucketUrl}`,
              "base-uri 'self'",
              `form-action 'self'${apiUrl ? ` ${apiUrl}` : ""}`,
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
    ];
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: "removeViewBox",
                  active: false,
                },
                {
                  name: "removeDimensions",
                  active: true,
                },
              ],
            },
          },
        },
      ],
    });

    // Fix for pdfjs-dist canvas dependency issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }

    // Externalize canvas for server builds
    config.externals = config.externals || [];
    if (
      typeof config.externals === "object" &&
      !Array.isArray(config.externals)
    ) {
      config.externals = [config.externals];
    }
    config.externals.push({
      canvas: "canvas",
    });

    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: "removeViewBox",
                    active: false,
                  },
                  {
                    name: "removeDimensions",
                    active: true,
                  },
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
