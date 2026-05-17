import "./DivergingCompareChart.css";

import { useId } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "../ui/chart";

type DivergingCompareDatum = {
  shotType: string;
  delta: number;
};

type DivergingCompareChartProps = {
  title?: string;
  player1: string;
  player2: string;
  playerOptions: { shooterId: string; shooterName: string }[];
  data: DivergingCompareDatum[];
  axisLabel: string;
  onPlayer1Change: (playerId: string) => void;
  onPlayer2Change: (playerId: string) => void;
};

function normalizeData(data: DivergingCompareDatum[]) {
  return data.map((row) => ({
    ...row,
    delta: Number(row.delta.toFixed(1)),
  }));
}

function formatAxisPercent(value: number) {
  return `${Math.abs(value).toFixed(0)}%`;
}

type CompareTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: string | number }>;
  label?: string | number;
};

function CompareTooltipContent({ active, payload, label }: CompareTooltipProps) {
  if (!active || !payload?.length) return null;

  const numericValue =
    typeof payload[0]?.value === "number" ? payload[0].value : Number(payload[0]?.value ?? 0);

  return (
    <div className="chart-tooltip">
      {label ? <p className="chart-tooltip__title">{label}</p> : null}
      <div className="chart-tooltip__row">
        <span className="chart-tooltip__label">Difference</span>
        <strong>{`${Math.abs(numericValue).toFixed(1)}%`}</strong>
      </div>
    </div>
  );
}

type CompareLegendContentProps = {
  player1Name: string;
  player2Name: string;
};

function CompareLegendContent({ player1Name, player2Name }: CompareLegendContentProps) {
  return (
    <div className="chart-legend chart-legend--compare">
      <span className="chart-legend__item">
        <span className="chart-legend__swatch" style={{ backgroundColor: "#2563eb" }} />
        <span className="chart-legend__text">{player1Name}</span>
      </span>
      <span className="chart-legend__item">
        <span className="chart-legend__swatch" style={{ backgroundColor: "#16a34a" }} />
        <span className="chart-legend__text">{player2Name}</span>
      </span>
    </div>
  );
}

export function DivergingCompareChart({
  title = "Compare Players",
  player1,
  player2,
  playerOptions,
  data,
  axisLabel,
  onPlayer1Change,
  onPlayer2Change,
}: DivergingCompareChartProps) {
  const player1FieldId = useId();
  const player2FieldId = useId();
  const chartData = normalizeData(data);
  const player1Name = playerOptions.find((player) => player.shooterId === player1)?.shooterName ?? "Player 1";
  const player2Name = playerOptions.find((player) => player.shooterId === player2)?.shooterName ?? "Player 2";

  return (
    <section className="dashboard-card compare-card">
      <div className="dashboard-card__header">
        <h2>{title}</h2>
      </div>

      <div className="compare-card__controls">
        <label className="compare-card__select compare-card__select--inline">
          <span className="compare-card__label compare-card__label--inline" id={`${player1FieldId}-label`}>
            Player 1:
          </span>
          <select
            id={player1FieldId}
            name="compare-player-1"
            className="compare-card__native-select"
            value={player1}
            aria-labelledby={`${player1FieldId}-label`}
            onChange={(event) => onPlayer1Change(event.target.value)}
          >
            {playerOptions.map((player) => (
              <option key={player.shooterId} value={player.shooterId}>
                {player.shooterName}
              </option>
            ))}
          </select>
        </label>

        <label className="compare-card__select compare-card__select--inline">
          <span className="compare-card__label compare-card__label--inline" id={`${player2FieldId}-label`}>
            Player 2:
          </span>
          <select
            id={player2FieldId}
            name="compare-player-2"
            className="compare-card__native-select"
            value={player2}
            aria-labelledby={`${player2FieldId}-label`}
            onChange={(event) => onPlayer2Change(event.target.value)}
          >
            {playerOptions.map((player) => (
              <option key={player.shooterId} value={player.shooterId}>
                {player.shooterName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="chart-frame">
        <ChartContainer
          config={{
            delta: { label: `${player1Name} (left) vs ${player2Name} (right)`, color: "#2563eb" },
          }}
          className="chart-frame__inner"
        >
          <BarChart layout="vertical" data={chartData} margin={{ top: 12, right: 48, left: 48, bottom: 28 }}>
            <CartesianGrid horizontal={false} stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[-15, 15]}
              tickFormatter={formatAxisPercent}
              tick={{ fill: "#64748b", fontSize: 12 }}
              label={{ value: axisLabel, position: "insideBottom", offset: -12, fill: "#475569" }}
            />
            <YAxis
              type="category"
              dataKey="shotType"
              tick={{ fill: "#1e293b", fontSize: 12 }}
              width={72}
            />
            <ReferenceLine x={0} stroke="#64748b" />
            <ChartTooltip content={<CompareTooltipContent />} cursor={{ fill: "rgba(219, 234, 254, 0.35)" }} />
            <ChartLegend verticalAlign="top" align="center" content={<CompareLegendContent player1Name={player1Name} player2Name={player2Name} />} />
            <Bar dataKey="delta" radius={6}>
              {chartData.map((row) => (
                <Cell key={row.shotType} fill={row.delta >= 0 ? "#16a34a" : "#2563eb"} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </section>
  );
}
