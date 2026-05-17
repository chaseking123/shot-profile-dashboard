import "./DateRangeFilter.css";

type DateRangeFilterProps = {
  dateFrom: string;
  dateTo: string;
  minDate?: string | null;
  maxDate?: string | null;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
};

export function DateRangeFilter({
  dateFrom,
  dateTo,
  minDate,
  maxDate,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  const fromMax = dateTo || maxDate || undefined;
  const toMin = dateFrom || minDate || undefined;

  return (
    <div className="filter-group filter-group--date-range" aria-label="Inclusive date range filter">
      <div className="filter-field">
        <label className="filter-label" htmlFor="date-from-filter">
          From
        </label>
        <input
          id="date-from-filter"
          className="filter-input"
          type="date"
          value={dateFrom}
          min={minDate ?? undefined}
          max={fromMax}
          onChange={(event) => onDateFromChange(event.target.value)}
        />
      </div>

      <div className="filter-field">
        <label className="filter-label" htmlFor="date-to-filter">
          To
        </label>
        <input
          id="date-to-filter"
          className="filter-input"
          type="date"
          value={dateTo}
          min={toMin}
          max={maxDate ?? undefined}
          onChange={(event) => onDateToChange(event.target.value)}
        />
      </div>
    </div>
  );
}
