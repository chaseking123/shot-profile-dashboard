import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { csvShotAnalyticsApi, getCachedShotsForDebug, preloadShotData } from "../data/api/csvShotAnalyticsApi";
import type {
  DashboardFilters,
  EfficiencyByShotTypeRow,
  FilterOptionsResponse,
  ShotTypeDistributionRow,
} from "../data/api/shotAnalyticsApi";
import type { ShotRecord } from "../data/models/shotSchemas";
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
  setActiveView: (view: DashboardView) => void;
  setPendingFilters: (updater: DashboardFilters | ((current: DashboardFilters) => DashboardFilters)) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  setCompareSelection: (
    view: DashboardView,
    next: { player1Id: string; player2Id: string },
  ) => void;
};

type DashboardDebugHandle = {
  shots: ShotRecord[];
  getCachedShots: typeof getCachedShotsForDebug;
  api: typeof csvShotAnalyticsApi;
};

declare global {
  interface Window {
    __shotDataDebug?: DashboardDebugHandle;
  }
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

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

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<DashboardView>("shot-type");
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

  const resetFilters = useCallback(() => {
    setPendingFiltersState(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
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
        const shots = await preloadShotData();
        const options = await csvShotAnalyticsApi.getFilterOptions();
        const [shotTypeResponse, efficiencyResponse] = await Promise.all([
          csvShotAnalyticsApi.getShotTypeByPlayer(DEFAULT_FILTERS),
          csvShotAnalyticsApi.getEfficiencyByShotType(DEFAULT_FILTERS),
        ]);

        if (cancelled) return;

        window.__shotDataDebug = {
          shots,
          getCachedShots: getCachedShotsForDebug,
          api: csvShotAnalyticsApi,
        };

        setFilterOptions(options);
        setShotTypeRows(shotTypeResponse.rows);
        setEfficiencyRows(efficiencyResponse.rows);
        setCompareSelections(getInitialCompareSelections(options));
      } catch (caughtError) {
        if (cancelled) return;

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
  }, []);

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
      setActiveView,
      setPendingFilters,
      applyFilters,
      resetFilters,
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
      setPendingFilters,
      applyFilters,
      resetFilters,
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
