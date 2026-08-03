/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "utfs.io"
    ]
  },
  async redirects() {
    return [
      {
        source: "/courses/:courseId/chapters/:chapterId",
        destination: "/cursos/:courseId/capitulos/:chapterId",
        permanent: true,
      },
      {
        source: "/courses/:courseId",
        destination: "/cursos/:courseId",
        permanent: true,
      },
      {
        source: "/teacher/create",
        destination: "/admin/cursos/nuevo",
        permanent: true,
      },
      {
        source: "/teacher/courses/:courseId/chapters/:chapterId",
        destination: "/admin/cursos/:courseId/capitulos/:chapterId",
        permanent: true,
      },
      {
        source: "/teacher/courses/:courseId",
        destination: "/admin/cursos/:courseId",
        permanent: true,
      },
      {
        source: "/teacher/courses",
        destination: "/admin/cursos",
        permanent: true,
      },
      {
        source: "/teacher/analytics",
        destination: "/admin/analiticas",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/cursos/:courseId/capitulos/:chapterId",
        destination: "/courses/:courseId/chapters/:chapterId",
      },
    ];
  },
}

module.exports = nextConfig
