/*
This file owns the shared dashboard state, data loading, and view-level actions used across the app.
It exposes a provider and hook so both screens can read filters, results, and compare selections from one place.
*/
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearShotDataCache,
  csvShotAnalyticsApi,
  getShotDataDiagnostics,
  preloadShotData,
} from "../data/api/csvShotAnalyticsApi";
import type {
  DashboardFilters,
  EfficiencyByShotTypeRow,
  FilterOptionsResponse,
  ShotTypeDistributionRow,
} from "../data/api/shotAnalyticsApi";
import { DEFAULT_FILTERS, type DashboardView } from "./dashboardState";

type CompareSelectionState = {
  shotType: {
    player1Id: string;
    player2Id: string;
  };
  efficiency: {
    player1Id: string;
    player2Id: string;
  };
};

type DashboardContextValue = {
  activeView: DashboardView;
  filters: DashboardFilters;
  pendingFilters: DashboardFilters;
  filterOptions: FilterOptionsResponse | null;
  shotTypeRows: ShotTypeDistributionRow[];
  efficiencyRows: EfficiencyByShotTypeRow[];
  compareSelections: CompareSelectionState;
  isLoading: boolean;
  error: string | null;
  dataWarning: string | null;
  setActiveView: (view: DashboardView) => void;
  setPendingFilters: (updater: DashboardFilters | ((current: DashboardFilters) => DashboardFilters)) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  retryDashboardData: () => void;
  setCompareSelection: (
    view: DashboardView,
    next: { player1Id: string; player2Id: string },
  ) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

// This helper resets filters that are not applicable to the efficiency view when switching views to prevent confusion from stale selections. 
// The shot type and outcome filters don't apply to the efficiency view since it shows overall FG% by shot type rather than frequency of different shot types, so we reset those to "all" when switching to efficiency.
function withEfficiencyHiddenFiltersReset(filters: DashboardFilters): DashboardFilters {
  return {
    ...filters,
    shotType: DEFAULT_FILTERS.shotType,
    outcome: DEFAULT_FILTERS.outcome,
  };
}

// Initializes the player comparison selections to the first two players in the filter options if available, or empty strings if not.
function getInitialCompareSelections(
  filterOptions: FilterOptionsResponse | null,
): CompareSelectionState {
  const player1Id = filterOptions?.players[0]?.shooterId ?? "";
  const player2Id = filterOptions?.players[1]?.shooterId ?? filterOptions?.players[0]?.shooterId ?? "";

  return {
    shotType: { player1Id, player2Id },
    efficiency: { player1Id, player2Id },
  };
}

// The provider component that wraps the dashboard views and manages all shared state, data loading, and actions. 
// It fetches the filter options and initial shot analytics on mount, and refetches analytics when filters are applied.
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveViewState] = useState<DashboardView>("shot-type");
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFiltersState] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [shotTypeRows, setShotTypeRows] = useState<ShotTypeDistributionRow[]>([]);
  const [efficiencyRows, setEfficiencyRows] = useState<EfficiencyByShotTypeRow[]>([]);
  const [compareSelections, setCompareSelections] = useState<CompareSelectionState>(
    getInitialCompareSelections(null),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataWarning, setDataWarning] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  const setPendingFilters = useCallback(
    (updater: DashboardFilters | ((current: DashboardFilters) => DashboardFilters)) => {
      setPendingFiltersState((current) =>
        typeof updater === "function" ? updater(current) : updater,
      );
    },
    [],
  );

  const applyFilters = useCallback(() => {
    setFilters(pendingFilters);
  }, [pendingFilters]);

  const setActiveView = useCallback((view: DashboardView) => {
    setActiveViewState(view);

    if (view === "efficiency") {
      setFilters((current) => withEfficiencyHiddenFiltersReset(current));
      setPendingFiltersState((current) => withEfficiencyHiddenFiltersReset(current));
    }
  }, []);

  const resetFilters = useCallback(() => {
    setPendingFiltersState(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const retryDashboardData = useCallback(() => {
    clearShotDataCache();
    setReloadVersion((current) => current + 1);
  }, []);

  const setCompareSelection = useCallback(
    (view: DashboardView, next: { player1Id: string; player2Id: string }) => {
      setCompareSelections((current) => ({
        ...current,
        [view]: next,
      }));
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function initializeDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        await preloadShotData();
        const options = await csvShotAnalyticsApi.getFilterOptions();
        const [shotTypeResponse, efficiencyResponse] = await Promise.all([
          csvShotAnalyticsApi.getShotTypeByPlayer(DEFAULT_FILTERS),
          csvShotAnalyticsApi.getEfficiencyByShotType(DEFAULT_FILTERS),
        ]);

        if (cancelled) return;

        setFilterOptions(options);
        setShotTypeRows(shotTypeResponse.rows);
        setEfficiencyRows(efficiencyResponse.rows);
        setCompareSelections(getInitialCompareSelections(options));
        setDataWarning(getShotDataDiagnostics()?.warningMessage ?? null);
      } catch (caughtError) {
        if (cancelled) return;

        setDataWarning(null);
        setError(caughtError instanceof Error ? caughtError.message : "Failed to load dashboard data.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    initializeDashboard();

    return () => {
      cancelled = true;
    };
  }, [reloadVersion]);

  useEffect(() => {
    let cancelled = false;

    async function refreshRows() {
      setIsLoading(true);
      setError(null);

      try {
        const [shotTypeResponse, efficiencyResponse] = await Promise.all([
          csvShotAnalyticsApi.getShotTypeByPlayer(filters),
          csvShotAnalyticsApi.getEfficiencyByShotType(filters),
        ]);

        if (cancelled) return;

        setShotTypeRows(shotTypeResponse.rows);
        setEfficiencyRows(efficiencyResponse.rows);
        setDataWarning(getShotDataDiagnostics()?.warningMessage ?? null);
      } catch (caughtError) {
        if (cancelled) return;

        setError(caughtError instanceof Error ? caughtError.message : "Failed to refresh dashboard data.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    refreshRows();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      activeView,
      filters,
      pendingFilters,
      filterOptions,
      shotTypeRows,
      efficiencyRows,
      compareSelections,
      isLoading,
      error,
      dataWarning,
      setActiveView,
      setPendingFilters,
      applyFilters,
      resetFilters,
      retryDashboardData,
      setCompareSelection,
    }),
    [
      activeView,
      filters,
      pendingFilters,
      filterOptions,
      shotTypeRows,
      efficiencyRows,
      compareSelections,
      isLoading,
      error,
      dataWarning,
      setActiveView,
      setPendingFilters,
      applyFilters,
      resetFilters,
      retryDashboardData,
      setCompareSelection,
    ],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider.");
  }

  return context;
}
