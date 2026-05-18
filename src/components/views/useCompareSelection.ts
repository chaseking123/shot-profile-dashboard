/*
This hook centralizes the shared compare-player selection behavior used by both dashboard views.
It keeps fallback selection, context synchronization, and highlighted-player derivation in one place.
*/
import { useCallback, useEffect, useMemo, useState } from "react";

import type { DashboardView } from "../../context/dashboardState";

type CompareSelectableRow = {
  shooterId: string;
  shooterName: string;
  isTeamAverage?: boolean;
};

type CompareSelection = {
  player1Id: string;
  player2Id: string;
};

type ComparePlayerOption = {
  shooterId: string;
  shooterName: string;
};

export function useCompareSelection(
  view: DashboardView,
  rows: CompareSelectableRow[],
  compareSelection: CompareSelection,
  setCompareSelection: (view: DashboardView, next: CompareSelection) => void,
) {
  const playerOptions = useMemo<ComparePlayerOption[]>(
    () =>
      rows
        .filter((row) => !row.isTeamAverage)
        .map((row) => ({
          shooterId: row.shooterId,
          shooterName: row.shooterName,
        })),
    [rows],
  );
  const availablePlayerIds = new Set(playerOptions.map((player) => player.shooterId));
  const fallbackPlayer1Id = playerOptions[0]?.shooterId ?? "";
  const fallbackPlayer2Id = playerOptions[1]?.shooterId ?? fallbackPlayer1Id;
  const syncedPlayer1Id = availablePlayerIds.has(compareSelection.player1Id)
    ? compareSelection.player1Id
    : fallbackPlayer1Id;
  const syncedPlayer2Id = availablePlayerIds.has(compareSelection.player2Id)
    ? compareSelection.player2Id
    : fallbackPlayer2Id;
  const [localCompareSelection, setLocalCompareSelection] = useState<CompareSelection>({
    player1Id: syncedPlayer1Id,
    player2Id: syncedPlayer2Id,
  });

  useEffect(() => {
    setLocalCompareSelection((current) => {
      if (current.player1Id === syncedPlayer1Id && current.player2Id === syncedPlayer2Id) {
        return current;
      }

      return {
        player1Id: syncedPlayer1Id,
        player2Id: syncedPlayer2Id,
      };
    });
  }, [syncedPlayer1Id, syncedPlayer2Id]);

  const updateCompareSelection = useCallback(
    (next: CompareSelection) => {
      setLocalCompareSelection(next);
      setCompareSelection(view, next);
    },
    [setCompareSelection, view],
  );

  return {
    playerOptions,
    selectedPlayer1Id: localCompareSelection.player1Id,
    selectedPlayer2Id: localCompareSelection.player2Id,
    highlightedPlayerIds: [localCompareSelection.player1Id, localCompareSelection.player2Id].filter(
      Boolean,
    ),
    updateCompareSelection,
  };
}
