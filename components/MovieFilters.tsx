import { ScrollView, Text, TouchableOpacity } from "react-native";

export type SortByOption = "popular" | "release_desc" | "release_asc";

export interface FiltersState {
  genreId: number | null;
  year: number | null;
  minRating: number | null;
  sortBy: SortByOption;
}

interface Props {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
}

const GENRE_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "All", value: null },
  { label: "Action", value: 28 },
  { label: "Drama", value: 18 },
  { label: "Comedy", value: 35 },
  { label: "Sci-Fi", value: 878 },
];

const YEAR_OPTIONS: Array<number | null> = [null, 2026, 2025, 2024, 2023, 2022];
const RATING_OPTIONS: Array<number | null> = [null, 5, 6, 7, 8];
const SORT_OPTIONS: Array<{ label: string; value: SortByOption }> = [
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "release_desc" },
  { label: "Oldest", value: "release_asc" },
];

const cycleValue = <T,>(options: T[], current: T): T => {
  const currentIndex = options.findIndex((option) => option === current);
  if (currentIndex === -1 || currentIndex === options.length - 1) {
    return options[0];
  }

  return options[currentIndex + 1];
};

const MovieFilters = ({ filters, onChange }: Props) => {
  const genreLabel =
    GENRE_OPTIONS.find((option) => option.value === filters.genreId)?.label ||
    "All";

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label ||
    "Popular";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      <TouchableOpacity
        className="bg-dark-100 rounded-full px-4 py-2"
        onPress={() => {
          const nextGenre = cycleValue(
            GENRE_OPTIONS.map((option) => option.value),
            filters.genreId
          );
          onChange({ ...filters, genreId: nextGenre });
        }}
      >
        <Text className="text-light-200 text-xs">Genre: {genreLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-dark-100 rounded-full px-4 py-2"
        onPress={() => {
          const nextYear = cycleValue(YEAR_OPTIONS, filters.year);
          onChange({ ...filters, year: nextYear });
        }}
      >
        <Text className="text-light-200 text-xs">
          Year: {filters.year ?? "All"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-dark-100 rounded-full px-4 py-2"
        onPress={() => {
          const nextRating = cycleValue(RATING_OPTIONS, filters.minRating);
          onChange({ ...filters, minRating: nextRating });
        }}
      >
        <Text className="text-light-200 text-xs">
          Rating: {filters.minRating ? `${filters.minRating}+` : "All"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-dark-100 rounded-full px-4 py-2"
        onPress={() => {
          const nextSort = cycleValue(
            SORT_OPTIONS.map((option) => option.value),
            filters.sortBy
          );
          onChange({ ...filters, sortBy: nextSort });
        }}
      >
        <Text className="text-light-200 text-xs">Release: {sortLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-accent rounded-full px-4 py-2"
        onPress={() => {
          onChange({
            genreId: null,
            year: null,
            minRating: null,
            sortBy: "popular",
          });
        }}
      >
        <Text className="text-white text-xs font-semibold">Reset</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MovieFilters;
