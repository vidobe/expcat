/* global WebImporter */

/**
 * Transformer for Epson Blog website cleanup
 * Purpose: Remove non-content elements and fix HTML issues
 * Applies to: blog.epson.com (all templates)
 * Generated: 2026-01-15
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (cleaned.html)
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform'
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove header/navigation (auto-populated in EDS)
    // EXTRACTED: Found .site-header in captured DOM
    WebImporter.DOMUtils.remove(element, ['.site-header']);

    // Remove footer (auto-populated in EDS)
    // EXTRACTED: Found .site-footer in captured DOM
    WebImporter.DOMUtils.remove(element, ['.site-footer']);

    // Remove filter section (dynamic functionality - skipped in migration)
    // EXTRACTED: Found .filter in captured DOM
    WebImporter.DOMUtils.remove(element, ['.filter']);

    // Remove load more button (dynamic pagination)
    // EXTRACTED: Found .latest__loadmore in captured DOM
    WebImporter.DOMUtils.remove(element, ['.latest__loadmore']);

    // Remove empty source elements from picture tags
    // EXTRACTED: Found empty <source> elements in captured DOM
    const emptySources = element.querySelectorAll('source:not([src])');
    for (const source of emptySources) {
      source.remove();
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove remaining unwanted elements
    // Standard HTML elements - safe to use
    WebImporter.DOMUtils.remove(element, [
      'video',
      'source',
      'noscript'
    ]);
  }
}
