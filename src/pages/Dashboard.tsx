import { useEffect, useState } from "react";

import api from "../services/api";
import RecentDeliveries from "../components/dashboard/RecentDeliveries";
import DeliveryTrendChart from "../components/dashboard/DeliveryTrendChart";

import type {
  DashboardSummary,
  DashboardSummaryResponse,
} from "../types/dashboard";

function Dashboard() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Periode Trend
  |--------------------------------------------------------------------------
  |
  | Default = 7 hari.
  |
  */
  const [trendPeriod, setTrendPeriod] =
    useState<7 | 30>(7);

  /*
  |--------------------------------------------------------------------------
  | Fetch Dashboard
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await api.get<DashboardSummaryResponse>(
            `/dashboard/summary?period=${trendPeriod}`
          );

        setSummary(response.data.data);
      } catch (err) {
        console.error(err);

        setError(
          "Gagal mengambil data dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [trendPeriod]);

  /*
  |--------------------------------------------------------------------------
  | Format Rupiah
  |--------------------------------------------------------------------------
  */
  const formatRupiah = (
    value: string | number
  ) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  return (
    <div>
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-400">
          Overview
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Ringkasan aktivitas pengiriman.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        {/* Total Pengiriman */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            Total Pengiriman
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {loading
              ? "..."
              : summary?.total_deliveries ?? 0}
          </p>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            Seluruh data pengiriman
          </p>
        </div>

        {/* Total Rit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            Total Rit
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {loading
              ? "..."
              : summary?.total_rits ?? 0}
          </p>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            Seluruh rit pengiriman
          </p>
        </div>

        {/* Ongkos Pending */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            Ongkos Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {loading
              ? "..."
              : summary?.pending_cost_deliveries ?? 0}
          </p>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            Ongkos belum ditentukan
          </p>
        </div>

        {/* Ongkos Sudah Ditentukan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            Ongkos Sudah Ditentukan
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {loading
              ? "..."
              : summary?.confirmed_cost_deliveries ?? 0}
          </p>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            Ongkos sudah dikonfirmasi
          </p>
        </div>

        {/* Belum Dibayar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            Belum Dibayar
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {loading
              ? "..."
              : summary?.unpaid_deliveries ?? 0}
          </p>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            Pengiriman belum dibayar
          </p>
        </div>

        {/* Sudah Dibayar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            Sudah Dibayar
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {loading
              ? "..."
              : summary?.paid_deliveries ?? 0}
          </p>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            Pengiriman sudah dibayar
          </p>
        </div>

        {/* Total Ongkos */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            Total Ongkos
          </p>

          <p className="mt-2 min-w-0 truncate text-xl font-bold text-slate-900 sm:text-2xl">
            {loading
              ? "..."
              : formatRupiah(
                  summary?.total_cost ?? 0
                )}
          </p>

          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            Total dari ongkos yang sudah ditentukan
          </p>
        </div>
      </div>

      {/* Trend Pengiriman */}
      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Tren Pengiriman
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jumlah rit pengiriman dalam{" "}
              {trendPeriod} hari terakhir.
            </p>
          </div>

          {/* Period Selector */}
          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setTrendPeriod(7)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                trendPeriod === 7
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              7 Hari
            </button>

            <button
              type="button"
              onClick={() => setTrendPeriod(30)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                trendPeriod === 30
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>

        <DeliveryTrendChart
          data={summary?.delivery_trend ?? []}
          loading={loading}
        />
      </section>

      {/* Pengiriman Terbaru */}
      <RecentDeliveries />
    </div>
  );
}

export default Dashboard;