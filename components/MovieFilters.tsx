import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type SortByOption = "popular" | "release_desc" | "release_asc";

export interface FiltersState {
  genreId: number | null;
  year: number | null;
  minRating: number | null;
  releaseDate: string | null;
  sortBy: SortByOption;
}

interface Props {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
}

const GENRE_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "All", value: null },
  { label: "Action", value: 28 },
  { label: "Adventure", value: 12 },
  { label: "Animation", value: 16 },
  { label: "Comedy", value: 35 },
  { label: "Crime", value: 80 },
  { label: "Drama", value: 18 },
  { label: "Fantasy", value: 14 },
  { label: "Horror", value: 27 },
  { label: "Mystery", value: 9648 },
  { label: "Romance", value: 10749 },
  { label: "Sci-Fi", value: 878 },
  { label: "Thriller", value: 53 },
];

const YEAR_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "All", value: null },
  { label: "2026", value: 2026 },
  { label: "2025", value: 2025 },
  { label: "2024", value: 2024 },
  { label: "2023", value: 2023 },
  { label: "2022", value: 2022 },
  { label: "2021", value: 2021 },
];

const RATING_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "All", value: null },
  { label: "5+", value: 5 },
  { label: "6+", value: 6 },
  { label: "7+", value: 7 },
  { label: "8+", value: 8 },
];

const SORT_OPTIONS: Array<{ label: string; value: SortByOption }> = [
  { label: "Popular", value: "popular" },
  { label: "Newest first", value: "release_desc" },
  { label: "Oldest first", value: "release_asc" },
];

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const DropdownField = ({
  label,
  value,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => {
  return (
    <View className="mb-3">
      <Text className="text-light-200 text-xs mb-2">{label}</Text>
      <TouchableOpacity
        className="bg-dark-100 rounded-xl px-4 py-3"
        onPress={onToggle}
      >
        <Text className="text-white">{value}</Text>
      </TouchableOpacity>
      {isOpen ? <View className="mt-2 bg-dark-100 rounded-xl p-2">{children}</View> : null}
    </View>
  );
};

const OptionButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className={`px-3 py-2 rounded-lg mb-1 ${active ? "bg-accent" : "bg-dark-200"}`}
    onPress={onPress}
  >
    <Text className="text-white text-sm">{label}</Text>
  </TouchableOpacity>
);

const MovieFilters = ({ filters, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<
    "genre" | "year" | "rating" | "sort" | null
  >(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.genreId) count += 1;
    if (filters.year) count += 1;
    if (filters.minRating) count += 1;
    if (filters.releaseDate) count += 1;
    if (filters.sortBy !== "popular") count += 1;
    return count;
  }, [filters]);

  const selectedGenre =
    GENRE_OPTIONS.find((option) => option.value === filters.genreId)?.label ||
    "All";

  const selectedYear =
    YEAR_OPTIONS.find((option) => option.value === filters.year)?.label || "All";

  const selectedRating =
    RATING_OPTIONS.find((option) => option.value === filters.minRating)?.label ||
    "All";

  const selectedSort =
    SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label ||
    "Popular";

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (date) {
      onChange({
        ...filters,
        releaseDate: formatDate(date),
      });
    }

    setShowDatePicker(false);
  };

  return (
    <View>
      <TouchableOpacity
        className="bg-dark-100 rounded-full px-4 py-2 self-start"
        onPress={() => setOpen(true)}
      >
        <Text className="text-white text-xs font-semibold">
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-primary rounded-t-3xl px-5 pt-5 pb-8 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">Filter Movies</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text className="text-accent font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <DropdownField
                label="Genre"
                value={selectedGenre}
                isOpen={activeField === "genre"}
                onToggle={() =>
                  setActiveField(activeField === "genre" ? null : "genre")
                }
              >
                {GENRE_OPTIONS.map((option) => (
                  <OptionButton
                    key={`genre-${String(option.value)}`}
                    label={option.label}
                    active={filters.genreId === option.value}
                    onPress={() => {
                      onChange({ ...filters, genreId: option.value });
                      setActiveField(null);
                    }}
                  />
                ))}
              </DropdownField>

              <DropdownField
                label="Year"
                value={selectedYear}
                isOpen={activeField === "year"}
                onToggle={() =>
                  setActiveField(activeField === "year" ? null : "year")
                }
              >
                {YEAR_OPTIONS.map((option) => (
                  <OptionButton
                    key={`year-${String(option.value)}`}
                    label={option.label}
                    active={filters.year === option.value}
                    onPress={() => {
                      onChange({ ...filters, year: option.value });
                      setActiveField(null);
                    }}
                  />
                ))}
              </DropdownField>

              <DropdownField
                label="Rating"
                value={selectedRating}
                isOpen={activeField === "rating"}
                onToggle={() =>
                  setActiveField(activeField === "rating" ? null : "rating")
                }
              >
                {RATING_OPTIONS.map((option) => (
                  <OptionButton
                    key={`rating-${String(option.value)}`}
                    label={option.label}
                    active={filters.minRating === option.value}
                    onPress={() => {
                      onChange({ ...filters, minRating: option.value });
                      setActiveField(null);
                    }}
                  />
                ))}
              </DropdownField>

              <DropdownField
                label="Release Date"
                value={filters.releaseDate || "Any date"}
                isOpen={false}
                onToggle={() => setShowDatePicker(true)}
              >
                <View />
              </DropdownField>

              <DropdownField
                label="Sort by Release"
                value={selectedSort}
                isOpen={activeField === "sort"}
                onToggle={() =>
                  setActiveField(activeField === "sort" ? null : "sort")
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <OptionButton
                    key={`sort-${option.value}`}
                    label={option.label}
                    active={filters.sortBy === option.value}
                    onPress={() => {
                      onChange({ ...filters, sortBy: option.value });
                      setActiveField(null);
                    }}
                  />
                ))}
              </DropdownField>

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  className="flex-1 bg-dark-100 rounded-xl py-3"
                  onPress={() => {
                    onChange({
                      genreId: null,
                      year: null,
                      minRating: null,
                      releaseDate: null,
                      sortBy: "popular",
                    });
                    setActiveField(null);
                  }}
                >
                  <Text className="text-white text-center font-semibold">Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-accent rounded-xl py-3"
                  onPress={() => setOpen(false)}
                >
                  <Text className="text-white text-center font-semibold">Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker ? (
        <DateTimePicker
          mode="date"
          display="default"
          value={filters.releaseDate ? new Date(filters.releaseDate) : new Date()}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      ) : null}
    </View>
  );
};

export default MovieFilters;
