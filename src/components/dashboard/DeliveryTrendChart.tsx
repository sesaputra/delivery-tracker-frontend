import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DeliveryTrend } from "../../types/dashboard";

interface DeliveryTrendChartProps {
  data: DeliveryTrend[];
  loading?: boolean;
}

function DeliveryTrendChart({
  data,
  loading = false,
}: DeliveryTrendChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
    }).format(
      new Date(`${item.date}T00:00:00`)
    ),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Loading */}
      {loading && (
        <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
          Memuat grafik...
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
          Belum ada data pengiriman.
        </div>
      )}

      {/* Chart */}
      {!loading && data.length > 0 && (
        <div className="h-[320px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              {/* Grid */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              {/* X Axis */}
              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />

              {/* Y Axis */}
              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              {/* Tooltip */}
              <Tooltip
                formatter={(value) => [
                  `${value ?? 0} rit`,
                  "Total",
                ]}
                labelFormatter={(label) =>
                  `Tanggal: ${label}`
                }
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 4px 12px rgba(15, 23, 42, 0.08)",
                }}
              />

              {/* Line */}
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0f172a"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default DeliveryTrendChart;