/**
 * @deprecated Use restore-product-images.ts instead.
 * This script previously overwrote local images with Unsplash stock photos.
 */

console.error(
  "❌ fix-product-images.ts is deprecated.\n" +
    "   It replaced your custom images with Unsplash stock photos.\n" +
    "   Run instead: npm run db:restore-images"
);
process.exit(1);
