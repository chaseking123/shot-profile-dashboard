import type { ReactElement, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";

type ChartConfig = Record<string, { label: string; color: string }>;

const ChartConfigContext = createContext<ChartConfig>({});

function formatPercentValue(value: string | number | undefined) {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
  return `${numericValue.toFixed(1)}%`;
}

type ChartContainerProps = {
  config: ChartConfig;
  className?: string;
  children: ReactNode;
};

export function ChartContainer({ config, className, children }: ChartContainerProps) {
  return (
    <ChartConfigContext.Provider value={config}>
      <div className={className ?? "chart-frame"}>
        <ResponsiveContainer width="100%" height="100%">
          {children as ReactElement}
        </ResponsiveContainer>
      </div>
    </ChartConfigContext.Provider>
  );
}

type ChartTooltipProps = Record<string, unknown>;

export function ChartTooltip(props: ChartTooltipProps) {
  return <Tooltip {...props} />;
}

type ChartTooltipEntry = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string | number;
};

export function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  const config = useContext(ChartConfigContext);

  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      {label ? <p className="chart-tooltip__title">{label}</p> : null}
      {payload.map((entry) => {
        const key = typeof entry.dataKey === "string" ? entry.dataKey : String(entry.name);
        const configEntry = config[key];

        return (
          <div className="chart-tooltip__row" key={key}>
            <span className="chart-tooltip__label">
              <span
                className="chart-tooltip__swatch"
                style={{ backgroundColor: entry.color ?? configEntry?.color ?? "#2563eb" }}
              />
              {configEntry?.label ?? entry.name}
            </span>
            <strong>{formatPercentValue(entry.value)}</strong>
          </div>
        );
      })}
    </div>
  );
}

type ChartLegendProps = Record<string, unknown>;

export function ChartLegend(props: ChartLegendProps) {
  return <Legend {...props} />;
}

type ChartLegendEntry = {
  color?: string;
  dataKey?: string | number;
  value?: string | number;
};

type ChartLegendContentProps = {
  payload?: ChartLegendEntry[];
};

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  const config = useContext(ChartConfigContext);

  if (!payload?.length) return null;

  return (
    <div className="chart-legend">
      {payload.map((entry) => {
        const key = typeof entry.dataKey === "string" ? entry.dataKey : String(entry.value);
        const configEntry = config[key];

        return (
          <span className="chart-legend__item" key={key}>
            <span
              className="chart-legend__swatch"
              style={{ backgroundColor: entry.color ?? configEntry?.color ?? "#2563eb" }}
            />
            {configEntry?.label ?? entry.value}
          </span>
        );
      })}
    </div>
  );
}
