/*
This component assembles the shared filter controls used by the dashboard views.
It manages which filters are visible and wires pending filter changes to apply and reset actions.
*/
import "./FilterToolbar.css";

import { RotateCcw } from "lucide-react";

import {
  contestLevelFilterOptions,
  creationFilterOptions,
  outcomeFilterOptions,
  shotClockFilterOptions,
  shotTypeFilterOptions,
} from "../../data/constants/filterConfig";
import type { DashboardFilters, FilterOptionsResponse } from "../../data/api/shotAnalyticsApi";
import { Button } from "../ui/Button";
import { FilterCombobox } from "./FilterCombobox";
import { DateRangeFilter } from "./DateRangeFilter";

type FilterToolbarProps = {
  value: DashboardFilters;
  pendingValue: DashboardFilters;
  onPendingChange: (next: DashboardFilters) => void;
  onApply: () => void;
  onReset: () => void;
  dateRange?: boolean;
  shotType?: boolean;
  outcome?: boolean;
  contestLevel?: boolean;
  creation?: boolean;
  shotClock?: boolean;
  applyButton?: boolean;
  resetButton?: boolean;
  filterOptions: FilterOptionsResponse;
};

function updatePendingValue<TKey extends keyof DashboardFilters>(
  current: DashboardFilters,
  key: TKey,
  nextValue: DashboardFilters[TKey],
): DashboardFilters {
  return {
    ...current,
    [key]: nextValue,
  };
}

function hasPendingChanges(value: DashboardFilters, pendingValue: DashboardFilters) {
  return JSON.stringify(value) !== JSON.stringify(pendingValue);
}

function updateDateRange(
  current: DashboardFilters,
  key: "dateFrom" | "dateTo",
  nextValue: string,
): DashboardFilters {
  const nextFilters: DashboardFilters = {
    ...current,
    [key]: nextValue,
  };

  if (nextFilters.dateFrom && nextFilters.dateTo && nextFilters.dateFrom > nextFilters.dateTo) {
    if (key === "dateFrom") {
      nextFilters.dateTo = nextFilters.dateFrom;
    } else {
      nextFilters.dateFrom = nextFilters.dateTo;
    }
  }

  return nextFilters;
}

export function FilterToolbar({
  value,
  pendingValue,
  onPendingChange,
  onApply,
  onReset,
  dateRange = false,
  shotType = false,
  outcome = false,
  contestLevel = false,
  creation = false,
  shotClock = false,
  applyButton = false,
  resetButton = false,
  filterOptions,
}: FilterToolbarProps) {
  const pendingChanged = hasPendingChanges(value, pendingValue);
  const MultiSelectControl = FilterCombobox;

  return (
    <section className="dashboard-card filter-toolbar" aria-label="Shared dashboard filters">
      <div className="filter-toolbar__controls">
        {dateRange ? (
          <DateRangeFilter
            dateFrom={pendingValue.dateFrom ?? ""}
            dateTo={pendingValue.dateTo ?? ""}
            minDate={filterOptions.minDate}
            maxDate={filterOptions.maxDate}
            onDateFromChange={(nextValue) =>
              onPendingChange(updateDateRange(pendingValue, "dateFrom", nextValue))
            }
            onDateToChange={(nextValue) =>
              onPendingChange(updateDateRange(pendingValue, "dateTo", nextValue))
            }
          />
        ) : null}

        {shotType ? (
          <MultiSelectControl
            label="Shot Type"
            value={pendingValue.shotType ?? []}
            options={shotTypeFilterOptions.filter(
              (option) => option.value === "all" || filterOptions.shotTypes.includes(option.value),
            )}
            onValueChange={(nextValue) =>
              onPendingChange(updatePendingValue(pendingValue, "shotType", nextValue))
            }
          />
        ) : null}

        {outcome ? (
          <MultiSelectControl
            label="Outcome"
            value={pendingValue.outcome ?? []}
            options={outcomeFilterOptions.filter(
              (option) => option.value === "all" || filterOptions.outcomes.includes(option.value),
            )}
            onValueChange={(nextValue) =>
              onPendingChange(updatePendingValue(pendingValue, "outcome", nextValue))
            }
          />
        ) : null}

        {contestLevel ? (
          <MultiSelectControl
            label="Contest Level"
            value={pendingValue.contestLevel ?? []}
            options={contestLevelFilterOptions.filter(
              (option) =>
                option.value === "all" || filterOptions.contestLevels.includes(option.value),
            )}
            onValueChange={(nextValue) =>
              onPendingChange(updatePendingValue(pendingValue, "contestLevel", nextValue))
            }
          />
        ) : null}

        {creation ? (
          <MultiSelectControl
            label="Creation"
            value={pendingValue.creation ?? []}
            options={creationFilterOptions.filter(
              (option) => option.value === "all" || filterOptions.creations.includes(option.value),
            )}
            onValueChange={(nextValue) =>
              onPendingChange(updatePendingValue(pendingValue, "creation", nextValue))
            }
          />
        ) : null}

        {shotClock ? (
          <MultiSelectControl
            label="Shot Clock"
            value={pendingValue.shotClock ?? []}
            options={shotClockFilterOptions.filter(
              (option) =>
                option.value === "all" || filterOptions.shotClockBuckets.includes(option.value),
            )}
            onValueChange={(nextValue) =>
              onPendingChange(updatePendingValue(pendingValue, "shotClock", nextValue))
            }
          />
        ) : null}

        {applyButton || resetButton ? (
          <div className="filter-toolbar__actions">
            {resetButton ? (
              <Button variant="outline" onClick={onReset}>
                <RotateCcw size={16} />
                <span>Reset</span>
              </Button>
            ) : null}
            {applyButton ? (
              <Button onClick={onApply} disabled={!pendingChanged}>
                Apply
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
