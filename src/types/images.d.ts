// Type declarations for static image imports
// Used by next/image with raw import paths like @/../public/logo/logo-tg-yellow.png
declare module "*.png" {
  const content: import("next/dist/shared/lib/get-img-props").StaticImageData
  export default content
}

declare module "*.jpg" {
  const content: import("next/dist/shared/lib/get-img-props").StaticImageData
  export default content
}

declare module "*.webp" {
  const content: import("next/dist/shared/lib/get-img-props").StaticImageData
  export default content
}
