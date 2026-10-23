import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import api from "../services/api";
import type {
  Delivery,
  DeliveryResponse,
  DeliverySummary,
  Driver,
  Vehicle,
} from "../types/delivery";

const Deliveries = () => {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [summary, setSummary] = useState<DeliverySummary>({
    total_cost: 0,
    paid_cost: 0,
    unpaid_cost: 0,
    pending_count: 0,
  });

  const [loading, setLoading] = useState(true);
  const [masterLoading, setMasterLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [masterError, setMasterError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [costStatus, setCostStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [showCostModal, setShowCostModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] =
    useState<Delivery | null>(null);

  const [costInput, setCostInput] = useState("");
  const [updatingCost, setUpdatingCost] = useState(false);
  const [costError, setCostError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const advancedFilterCount = [
    vehicleId,
    costStatus,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(
    driverId ||
      paymentStatus ||
      vehicleId ||
      costStatus ||
      dateFrom ||
      dateTo
  );

  const getErrorMessage = (
    err: unknown,
    fallback: string
  ): string => {
    if (!axios.isAxiosError(err)) {
      return fallback;
    }

    const data: unknown = err.response?.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data
    ) {
      const message = data.message;

      if (typeof message === "string") {
        return message;
      }
    }

    return fallback;
  };

  const getValidationErrorMessage = (
    err: unknown,
    fallback: string
  ): string => {
    if (!axios.isAxiosError(err)) {
      return fallback;
    }

    const data: unknown = err.response?.data;

    if (typeof data === "object" && data !== null) {
      if ("errors" in data) {
        const errors = data.errors;

        if (typeof errors === "object" && errors !== null) {
          for (const value of Object.values(errors)) {
            if (Array.isArray(value)) {
              const firstError = value.find(
                (item): item is string => typeof item === "string"
              );

              if (firstError) {
                return firstError;
              }
            }
          }
        }
      }

      if ("message" in data) {
        const message = data.message;

        if (typeof message === "string") {
          return message;
        }
      }
    }

    return fallback;
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatRupiah = (value: string | number | null) => {
    if (value === null) {
      return "Belum Ditentukan";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  useEffect(() => {
    let cancelled = false;

    const loadMasterData = async () => {
      try {
        setMasterError(null);

        const [driversResponse, vehiclesResponse] =
          await Promise.all([
            api.get<{ data: Driver[] }>("/drivers"),
            api.get<{ data: Vehicle[] }>("/vehicles"),
          ]);

        if (cancelled) {
          return;
        }

        setDrivers(driversResponse.data.data);
        setVehicles(vehiclesResponse.data.data);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        setMasterError(
          getErrorMessage(
            err,
            "Gagal memuat data sopir dan kendaraan."
          )
        );
      } finally {
        if (!cancelled) {
          setMasterLoading(false);
        }
      }
    };

    void loadMasterData();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchDeliveries = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (search.trim()) {
          params.append("search", search.trim());
        }

        if (driverId) {
          params.append("driver_id", driverId);
        }

        if (vehicleId) {
          params.append("vehicle_id", vehicleId);
        }

        if (costStatus) {
          params.append("cost_status", costStatus);
        }

        if (paymentStatus) {
          params.append("payment_status", paymentStatus);
        }

        if (dateFrom) {
          params.append("date_from", dateFrom);
        }

        if (dateTo) {
          params.append("date_to", dateTo);
        }

        params.append("page", String(page));
        params.append("per_page", "10");

        const response = await api.get<DeliveryResponse>(
          `/deliveries?${params.toString()}`
        );

        setDeliveries(response.data.data);
        setCurrentPage(response.data.meta.current_page);
        setLastPage(response.data.meta.last_page);
        setTotal(response.data.meta.total);
        setSummary(response.data.summary);
      } catch (err: unknown) {
        setError(
          getErrorMessage(
            err,
            "Gagal memuat data pengiriman."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [
      search,
      driverId,
      vehicleId,
      costStatus,
      paymentStatus,
      dateFrom,
      dateTo,
    ]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      void fetchDeliveries(1);
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [
    search,
    driverId,
    vehicleId,
    costStatus,
    paymentStatus,
    dateFrom,
    dateTo,
    fetchDeliveries,
  ]);

  const handleResetFilters = () => {
    setSearch("");
    setDriverId("");
    setVehicleId("");
    setCostStatus("");
    setPaymentStatus("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (driverId) {
        params.append("driver_id", driverId);
      }

      if (vehicleId) {
        params.append("vehicle_id", vehicleId);
      }

      if (costStatus) {
        params.append("cost_status", costStatus);
      }

      if (paymentStatus) {
        params.append("payment_status", paymentStatus);
      }

      if (dateFrom) {
        params.append("date_from", dateFrom);
      }

      if (dateTo) {
        params.append("date_to", dateTo);
      }

      const response = await api.get(
        `/deliveries/export?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"];

      const blob = new Blob([response.data], {
        type:
          typeof contentType === "string"
            ? contentType
            : "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `delivery-tracker-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Gagal mengekspor data pengiriman."
        )
      );
    }
  };

  const handleCreateDelivery = async () => {
    setCreateError(null);

    if (!deliveryDate) {
      setCreateError("Tanggal pengiriman wajib diisi.");
      return;
    }

    if (!selectedDriverId) {
      setCreateError("Sopir wajib dipilih.");
      return;
    }

    if (!description.trim()) {
      setCreateError("Keterangan wajib diisi.");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setCreateError(
        "Jumlah harus berupa angka bulat lebih dari 0."
      );
      return;
    }

    const parsedUnitCost =
      unitCost.trim() === "" ? null : Number(unitCost);

    if (
      parsedUnitCost !== null &&
      (!Number.isFinite(parsedUnitCost) || parsedUnitCost <= 0)
    ) {
      setCreateError("Ongkos harus lebih dari 0.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/deliveries", {
        delivery_date: deliveryDate,
        driver_id: Number(selectedDriverId),
        description: description.trim(),
        quantity: parsedQuantity,
        unit_cost: parsedUnitCost,
      });

      setShowCreateModal(false);
      setDeliveryDate("");
      setSelectedDriverId("");
      setDescription("");
      setQuantity("1");
      setUnitCost("");
      setCreateError(null);

      await fetchDeliveries(1);
    } catch (err: unknown) {
      setCreateError(
        getValidationErrorMessage(
          err,
          "Gagal membuat pengiriman."
        )
      );
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCostModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setCostInput(
      delivery.unit_cost !== null
        ? String(delivery.unit_cost)
        : ""
    );
    setCostError(null);
    setShowCostModal(true);
  };

  const handleCloseCostModal = () => {
    if (updatingCost) {
      return;
    }

    setShowCostModal(false);
    setSelectedDelivery(null);
    setCostInput("");
    setCostError(null);
  };

  const handleUpdateCost = async () => {
    if (!selectedDelivery) {
      return;
    }

    setCostError(null);

    const parsedCost = Number(costInput);

    if (!Number.isFinite(parsedCost) || parsedCost <= 0) {
      setCostError("Ongkos harus lebih dari 0.");
      return;
    }

    try {
      setUpdatingCost(true);

      await api.patch<{ data: Delivery }>(
        `/deliveries/${selectedDelivery.id}/cost`,
        {
          unit_cost: parsedCost,
        }
      );

      setSelectedDelivery(null);
      setCostInput("");
      setCostError(null);
      setShowCostModal(false);

      await fetchDeliveries(currentPage);
    } catch (err: unknown) {
      setCostError(
        getErrorMessage(
          err,
          "Gagal memperbarui ongkos."
        )
      );
    } finally {
      setUpdatingCost(false);
    }
  };

  const selectedDriver = drivers.find(
    (driver) => String(driver.id) === selectedDriverId
  );

  const selectedVehicle = selectedDriver?.vehicle ?? null;

  const formatRupiahCompact = (value: number | null | undefined) => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "Rp0";

  if (amount >= 1_000_000_000) {
    return `Rp${(amount / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} M`;
  }

  if (amount >= 1_000_000) {
    return `Rp${(amount / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} jt`;
  }

  if (amount >= 1_000) {
    return `Rp${(amount / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} rb`;
  }

  return formatRupiah(amount);
};

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Operasional
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Pengiriman
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola data pengiriman dan ongkos transportasi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateError(null);
            setShowCreateModal(true);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Tambah Pengiriman
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-xs font-semibold text-slate-500"
              >
                Pencarian
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari sopir, plat nomor, atau keterangan..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="driver-filter"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Sopir
                </label>

                <select
                  id="driver-filter"
                  value={driverId}
                  onChange={(event) => setDriverId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">Semua Sopir</option>

                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="payment-filter"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Pembayaran
                </label>

                <select
                  id="payment-filter"
                  value={paymentStatus}
                  onChange={(event) =>
                    setPaymentStatus(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">Semua Status Pembayaran</option>
                  <option value="paid">Sudah Dibayar</option>
                  <option value="unpaid">Belum Dibayar</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAdvancedFilters((current) => !current)
              }
              className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />

                <span>Filter lainnya</span>

                {advancedFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-semibold text-white">
                    {advancedFilterCount}
                  </span>
                )}
              </span>

              {showAdvancedFilters ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="vehicle-filter"
                    className="mb-2 block text-xs font-semibold text-slate-500"
                  >
                    Kendaraan
                  </label>

                  <select
                    id="vehicle-filter"
                    value={vehicleId}
                    onChange={(event) => setVehicleId(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">Semua Kendaraan</option>

                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cost-status-filter"
                    className="mb-2 block text-xs font-semibold text-slate-500"
                  >
                    Status Ongkos
                  </label>

                  <select
                    id="cost-status-filter"
                    value={costStatus}
                    onChange={(event) => setCostStatus(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">Semua Status Ongkos</option>
                    <option value="confirmed">Sudah Ditentukan</option>
                    <option value="pending">Belum Ditentukan</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="date-from"
                    className="mb-2 block text-xs font-semibold text-slate-500"
                  >
                    Tanggal Mulai
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(event) => setDateFrom(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="date-to"
                    className="mb-2 block text-xs font-semibold text-slate-500"
                  >
                    Tanggal Akhir
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(event) => setDateTo(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {driverId && (
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                    Sopir:{" "}
                    {
                      drivers.find(
                        (driver) => String(driver.id) === driverId
                      )?.name
                    }
                  </span>
                )}

                {paymentStatus && (
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                    Pembayaran:{" "}
                    {paymentStatus === "paid"
                      ? "Sudah Dibayar"
                      : "Belum Dibayar"}
                  </span>
                )}

                {vehicleId && (
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                    Kendaraan:{" "}
                    {
                      vehicles.find(
                        (vehicle) => String(vehicle.id) === vehicleId
                      )?.plate_number
                    }
                  </span>
                )}

                {costStatus && (
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                    Ongkos:{" "}
                    {costStatus === "confirmed"
                      ? "Sudah Ditentukan"
                      : "Belum Ditentukan"}
                  </span>
                )}

                {dateFrom && (
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                    Dari: {formatDate(dateFrom)}
                  </span>
                )}

                {dateTo && (
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                    Sampai: {formatDate(dateTo)}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {total}
                </span>{" "}
                pengiriman
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] sm:flex-none"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] sm:flex-none"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {masterError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {masterError}
        </div>
      )}

<section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
  {/* Total Ongkos */}
  <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">
          Total Ongkos
        </p>

        <p
          className="mt-2 break-words text-base font-bold leading-tight text-slate-900 sm:text-xl"
          title={formatRupiah(summary.total_cost)}
        >
          <span className="sm:hidden">
            {formatRupiahCompact(summary.total_cost)}
          </span>
          <span className="hidden sm:inline">
            {formatRupiah(summary.total_cost)}
          </span>
        </p>
      </div>

      <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <CircleDollarSign className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />
      </div>
    </div>
  </div>

  {/* Sudah Dibayar */}
  <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">
          Sudah Dibayar
        </p>

        <p
          className="mt-2 break-words text-base font-bold leading-tight text-emerald-600 sm:text-xl"
          title={formatRupiah(summary.paid_cost)}
        >
          <span className="sm:hidden">
            {formatRupiahCompact(summary.paid_cost)}
          </span>
          <span className="hidden sm:inline">
            {formatRupiah(summary.paid_cost)}
          </span>
        </p>
      </div>

      <div className="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-2">
        <Check className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
      </div>
    </div>
  </div>

  {/* Belum Dibayar */}
  <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">
          Belum Dibayar
        </p>

        <p
          className="mt-2 break-words text-base font-bold leading-tight text-amber-600 sm:text-xl"
          title={formatRupiah(summary.unpaid_cost)}
        >
          <span className="sm:hidden">
            {formatRupiahCompact(summary.unpaid_cost)}
          </span>
          <span className="hidden sm:inline">
            {formatRupiah(summary.unpaid_cost)}
          </span>
        </p>
      </div>

      <div className="shrink-0 rounded-xl border border-amber-100 bg-amber-50 p-2">
        <CircleDollarSign className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />
      </div>
    </div>
  </div>

  {/* Ongkos Pending */}
  <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">
          Ongkos Pending
        </p>

        <p className="mt-2 break-words text-base font-bold leading-tight text-slate-900 sm:text-xl">
          {summary.pending_count.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <Truck className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />
      </div>
    </div>
  </div>
</section>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 rounded-lg p-1 transition hover:bg-red-100"
            aria-label="Tutup pesan error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section>
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
              <Truck className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Memuat data pengiriman...
            </p>
          </div>
        )}

        {!loading && !error && deliveries.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
              <Truck className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Data pengiriman tidak ditemukan
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Coba gunakan filter atau kata kunci pencarian yang berbeda.
            </p>
          </div>
        )}

        {!loading && !error && deliveries.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-3.5 md:hidden">
              {deliveries.map((delivery) => {
                const isCostPending =
                  delivery.cost_status === "pending";
                const isPaid = delivery.payment_status === "paid";

                return (
                  <article
                    key={delivery.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/deliveries/${delivery.id}`)
                      }
                      className="block w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-slate-400">
                              {formatDate(delivery.delivery_date)}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-slate-300" />

                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              {delivery.vehicle?.plate_number ?? "-"}
                            </span>
                          </div>

                          <h3 className="mt-2 text-sm font-bold text-slate-900">
                            {delivery.driver?.name ?? "-"}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {delivery.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                              isCostPending
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {isCostPending
                              ? "Pending"
                              : "Confirmed"}
                          </span>

                          {!isCostPending && (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                                isPaid
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {isPaid
                                ? "Sudah Dibayar"
                                : "Belum Dibayar"}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3.5">
                      <div>
                        <p className="text-[11px] font-medium text-slate-400">
                          Total · {delivery.quantity} rit
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                          {isCostPending
                            ? "Belum Ditentukan"
                            : formatRupiah(
                                delivery.total_cost
                              )}
                        </p>
                      </div>

                      {isCostPending ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCostModal(delivery)
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-95"
                        >
                          <CircleDollarSign className="h-3.5 w-3.5" />
                          Set Ongkos
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/deliveries/${delivery.id}`)
                          }
                          className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          Detail
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      <th className="px-5 py-3.5 text-left">
                        Tanggal
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        Sopir
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        Kendaraan
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        Keterangan
                      </th>
                      <th className="px-4 py-3.5 text-center">
                        Rit
                      </th>
                      <th className="px-5 py-3.5 text-right">
                        Harga / Rit
                      </th>
                      <th className="px-5 py-3.5 text-right">
                        Total
                      </th>
                      <th className="px-4 py-3.5 text-center">
                        Ongkos
                      </th>
                      <th className="px-4 py-3.5 text-center">
                        Pembayaran
                      </th>
                      <th className="px-5 py-3.5 text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {deliveries.map((delivery) => {
                      const isCostPending =
                        delivery.cost_status === "pending";
                      const isPaid =
                        delivery.payment_status === "paid";

                      return (
                        <tr
                          key={delivery.id}
                          className="group transition hover:bg-slate-50/70"
                        >
                          <td
                            className="cursor-pointer whitespace-nowrap px-5 py-4 text-slate-500"
                            onClick={() =>
                              navigate(`/deliveries/${delivery.id}`)
                            }
                          >
                            {formatDate(delivery.delivery_date)}
                          </td>

                          <td
                            className="cursor-pointer px-5 py-4"
                            onClick={() =>
                              navigate(`/deliveries/${delivery.id}`)
                            }
                          >
                            <span className="font-semibold text-slate-900">
                              {delivery.driver?.name ?? "-"}
                            </span>
                          </td>

                          <td
                            className="cursor-pointer whitespace-nowrap px-5 py-4"
                            onClick={() =>
                              navigate(`/deliveries/${delivery.id}`)
                            }
                          >
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {delivery.vehicle?.plate_number ?? "-"}
                            </span>
                          </td>

                          <td
                            className="max-w-xs cursor-pointer px-5 py-4 text-slate-500"
                            onClick={() =>
                              navigate(`/deliveries/${delivery.id}`)
                            }
                          >
                            <span className="line-clamp-2">
                              {delivery.description}
                            </span>
                          </td>

                          <td
                            className="cursor-pointer px-4 py-4 text-center"
                            onClick={() =>
                              navigate(`/deliveries/${delivery.id}`)
                            }
                          >
                            <span className="font-semibold text-slate-800">
                              {delivery.quantity}
                            </span>
                          </td>

                          <td
                            className="cursor-pointer whitespace-nowrap px-5 py-4 text-right"
                            onClick={() =>
                              navigate(`/deliveries/${delivery.id}`)
                            }
                          >
                            {isCostPending ? (
                              <span className="text-xs font-medium text-amber-600">
                                Belum Ditentukan
                              </span>
                            ) : (
                              <span className="text-slate-600">
                                {formatRupiah(delivery.unit_cost)}
                              </span>
                            )}
                          </td>

                          <td
                            className="cursor-pointer whitespace-nowrap px-5 py-4 text-right"
                            onClick={() =>
                              navigate(`/deliveries/${delivery.id}`)
                            }
                          >
                            {isCostPending ? (
                              <span className="text-xs font-medium text-amber-600">
                                Belum Ditentukan
                              </span>
                            ) : (
                              <span className="font-bold text-slate-900">
                                {formatRupiah(
                                  delivery.total_cost
                                )}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                isCostPending
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {isCostPending
                                ? "Pending"
                                : "Confirmed"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            {isCostPending ? (
                              <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                                Belum Ditentukan
                              </span>
                            ) : (
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                  isPaid
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}
                              >
                                {isPaid
                                  ? "Sudah Dibayar"
                                  : "Belum Dibayar"}
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-center">
                            {isCostPending ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenCostModal(delivery)
                                }
                                className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-95"
                              >
                                <CircleDollarSign className="h-3.5 w-3.5" />
                                Tentukan
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/deliveries/${delivery.id}`
                                  )
                                }
                                className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                              >
                                Detail
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
              <p className="text-xs text-slate-500 sm:text-sm">
                Halaman{" "}
                <span className="font-semibold text-slate-800">
                  {currentPage}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-800">
                  {lastPage}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void fetchDeliveries(currentPage - 1)
                  }
                  disabled={currentPage <= 1 || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void fetchDeliveries(currentPage + 1)
                  }
                  disabled={currentPage >= lastPage || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tambah Pengiriman
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Masukkan informasi pengiriman baru.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!creating) {
                    setShowCreateModal(false);
                    setCreateError(null);
                  }
                }}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              {createError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div>
                <label
                  htmlFor="delivery-date"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Tanggal
                </label>

                <input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(event) =>
                    setDeliveryDate(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="delivery-driver"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Sopir
                </label>

                <select
                  id="delivery-driver"
                  value={selectedDriverId}
                  onChange={(event) =>
                    setSelectedDriverId(event.target.value)
                  }
                  disabled={masterLoading}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                >
                  <option value="">Pilih Sopir</option>

                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDriver && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">
                      <Truck className="h-4 w-4 text-slate-600" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Kendaraan
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-slate-800">
                        {selectedVehicle?.plate_number ??
                          "Belum memiliki kendaraan"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="delivery-description"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Keterangan
                </label>

                <textarea
                  id="delivery-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={3}
                  placeholder="Contoh: Pasir halus penamparan MKP"
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="delivery-quantity"
                    className="mb-2 block text-xs font-semibold text-slate-500"
                  >
                    Jumlah / Rit
                  </label>

                  <input
                    id="delivery-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="delivery-cost"
                    className="mb-2 block text-xs font-semibold text-slate-500"
                  >
                    Ongkos / Rit
                  </label>

                  <input
                    id="delivery-cost"
                    type="number"
                    min="0"
                    step="1000"
                    value={unitCost}
                    onChange={(event) =>
                      setUnitCost(event.target.value)
                    }
                    placeholder="Opsional"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                disabled={creating}
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError(null);
                }}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={creating}
                onClick={() => void handleCreateDelivery()}
                className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Menyimpan..." : "Simpan Pengiriman"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCostModal && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <div className="w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tentukan Ongkos
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Masukkan ongkos pengiriman per rit.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCostModal}
                disabled={updatingCost}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              {costError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {costError}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">
                      Sopir
                    </span>

                    <span className="text-sm font-semibold text-slate-800">
                      {selectedDelivery.driver?.name ?? "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">
                      Kendaraan
                    </span>

                    <span className="text-sm font-semibold text-slate-800">
                      {selectedDelivery.vehicle?.plate_number ?? "-"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="shrink-0 text-xs text-slate-500">
                      Keterangan
                    </span>

                    <span className="max-w-[210px] text-right text-xs font-medium leading-relaxed text-slate-700">
                      {selectedDelivery.description}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
                    <span className="text-xs text-slate-500">
                      Jumlah
                    </span>

                    <span className="text-sm font-semibold text-slate-800">
                      {selectedDelivery.quantity} rit
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="update-cost"
                  className="mb-2 block text-xs font-semibold text-slate-500"
                >
                  Ongkos / Rit
                </label>

                <input
                  id="update-cost"
                  type="number"
                  min="1"
                  step="1000"
                  value={costInput}
                  onChange={(event) =>
                    setCostInput(event.target.value)
                  }
                  placeholder="Contoh: 1600000"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                disabled={updatingCost}
                onClick={handleCloseCostModal}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={updatingCost}
                onClick={() => void handleUpdateCost()}
                className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingCost ? "Menyimpan..." : "Simpan Ongkos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;