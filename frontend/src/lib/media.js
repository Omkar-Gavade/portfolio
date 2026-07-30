/**
 * Flattens a project's `media` block into an ordered list of carousel slides.
 * Video wins over GIF when both are supplied — same content, smaller file.
 */
export function toSlides(media = {}) {
  const slides = [];

  if (media.cover) {
    slides.push({ type: "image", src: media.cover, alt: "Project preview" });
  }

  if (media.video) {
    slides.push({
      type: "video",
      src: media.video,
      poster: media.poster ?? media.cover,
      alt: "Demo recording",
    });
  } else if (media.gif) {
    slides.push({ type: "gif", src: media.gif, alt: "Demo recording" });
  }

  (media.screenshots ?? []).forEach((shot, i) =>
    slides.push({
      type: "image",
      src: shot.src,
      alt: shot.alt ?? `Screenshot ${i + 1}`,
    })
  );

  return slides;
}
