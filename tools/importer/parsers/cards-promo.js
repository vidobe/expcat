/* global WebImporter */

/**
 * Parser for cards-promo block
 *
 * Source: https://blog.epson.com/
 * Base Block: cards
 *
 * Block Structure:
 * - Row 1: Block name header
 * - Row 2-N: Each card = 1 row with content [category, heading, description, CTA link]
 *
 * Source HTML Pattern:
 * <div class="call-to-action call-to-action--video">
 *   <a class="call-to-action__link" href="...">
 *     <video class="call-to-action__video">
 *       <source src="...">
 *     </video>
 *   </a>
 * </div>
 *
 * Note: The source HTML only contains video/link, but the visual design shows
 * category, title, description, and CTA button. This parser handles the basic
 * structure; additional content may need manual enrichment.
 *
 * Generated: 2026-01-15
 */
export default function parse(element, { document }) {
  // Extract link
  // VALIDATED: Found .call-to-action__link in captured DOM
  const link = element.querySelector('.call-to-action__link');

  // Build content cell
  const contentCell = document.createElement('div');

  // Add category (from migration analysis)
  const categoryP = document.createElement('p');
  categoryP.textContent = 'Webinar';
  contentCell.appendChild(categoryP);

  // Add placeholder heading - would need to extract from actual page data
  const h3 = document.createElement('h3');
  h3.textContent = 'Promotional Content';
  contentCell.appendChild(h3);

  // Add description placeholder
  const descP = document.createElement('p');
  descP.textContent = 'View this webinar or whitepaper for more information.';
  contentCell.appendChild(descP);

  // Add CTA link
  if (link) {
    const ctaLink = document.createElement('a');
    ctaLink.href = link.href;
    ctaLink.textContent = 'GET THE WHITE PAPER';
    contentCell.appendChild(ctaLink);
  }

  // Build cells array - single content cell (no image for this variant)
  const cells = [
    [contentCell]
  ];

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Promo', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
