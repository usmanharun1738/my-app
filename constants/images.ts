import bg from "@/assets/images/bg.png";
import highlight from "@/assets/images/highlight.png";
import rankingGradient from "@/assets/images/rankingGradient.png";

export const POSTER_PLACEHOLDER_URI =
  "https://placehold.co/500x750/0f0d23/A8B5DB.png?text=No+Poster";

export const getPosterImageUri = (
  posterPath?: string | null,
  size: "w500" | "original" = "w500"
) => {
  if (!posterPath) {
    return POSTER_PLACEHOLDER_URI;
  }

  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

export const images = {
  bg,
  highlight,
  rankingGradient,
};
