/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',  // 添加这行来支持静态导出
  images: {
    unoptimized: true,  // 添加这行来支持图片静态导出
  },
}

module.exports = nextConfig
