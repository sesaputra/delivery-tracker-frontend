import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Check,
  CircleDollarSign,
  CreditCard,
  Package,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";
import type {
  Delivery,
  DeliveryDetailResponse,
} from "../types/delivery";

function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] =
    useState<Delivery | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // =========================
  // Payment State
  // =========================

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [updatingPayment, setUpdatingPayment] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState<string | null>(null);

  // =========================
  // Cost State
  // =========================

  const [showCostModal, setShowCostModal] =
    useState(false);

  const [costInput, setCostInput] =
    useState("");

  const [updatingCost, setUpdatingCost] =
    useState(false);

  const [costError, setCostError] =
    useState<string | null>(null);

  // =========================
  // Delete State
  // =========================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deletingDelivery, setDeletingDelivery] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  // =========================
  // Fetch Delivery
  // =========================

  useEffect(() => {
    let cancelled = false;

    const fetchDelivery = async () => {
      try {
        setLoading(true);

        const response =
          await api.get<DeliveryDetailResponse>(
            `/deliveries/${id}`
          );

        if (cancelled) {
          return;
        }

        setDelivery(response.data.data);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(err);

        setError(
          "Data pengiriman tidak ditemukan."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDelivery();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =========================
  // Helpers
  // =========================

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatRupiah = (
    value: string | number | null
  ) => {
    if (value === null) {
      return "Belum Ditentukan";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  // =========================
  // Cost Modal
  // =========================

  const handleOpenCostModal = () => {
    if (!delivery) {
      return;
    }

    setCostError(null);

    /*
     * Jika ongkos sudah ditentukan,
     * tampilkan nominal lama untuk diedit.
     *
     * Jika ongkos masih pending,
     * kosongkan input.
     */
    if (
      delivery.cost_status === "confirmed" &&
      delivery.unit_cost !== null
    ) {
      setCostInput(
        String(Number(delivery.unit_cost))
      );
    } else {
      setCostInput("");
    }

    setShowCostModal(true);
  };

  const handleCloseCostModal = () => {
    if (updatingCost) {
      return;
    }

    setCostError(null);
    setCostInput("");
    setShowCostModal(false);
  };

  const handleCostUpdate = async () => {
    if (!delivery) {
      return;
    }

    if (costInput.trim() === "") {
      setCostError(
        "Ongkos per rit wajib diisi."
      );

      return;
    }

    const unitCost = Number(costInput);

    if (
      !Number.isFinite(unitCost) ||
      unitCost <= 0
    ) {
      setCostError(
        "Ongkos harus berupa angka lebih dari 0."
      );

      return;
    }

    try {
      setUpdatingCost(true);
      setCostError(null);

      const response =
        await api.patch<DeliveryDetailResponse>(
          `/deliveries/${delivery.id}/cost`,
          {
            unit_cost: unitCost,
          }
        );

      /*
       * Gunakan data terbaru dari backend.
       * Backend sudah menghitung ulang total_cost.
       */
      setDelivery(response.data.data);

      setCostInput("");
      setShowCostModal(false);
    } catch (err) {
      console.error(err);

      setCostError(
        "Ongkos pengiriman gagal diperbarui. Silakan coba lagi."
      );
    } finally {
      setUpdatingCost(false);
    }
  };

  // =========================
  // Payment Modal
  // =========================

  const handleOpenPaymentModal = () => {
    setPaymentError(null);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    if (updatingPayment) {
      return;
    }

    setPaymentError(null);
    setShowPaymentModal(false);
  };

  const handlePaymentUpdate = async () => {
    if (!delivery) {
      return;
    }

    try {
      setUpdatingPayment(true);
      setPaymentError(null);

      const response =
        await api.patch<DeliveryDetailResponse>(
          `/deliveries/${delivery.id}/payment-status`
        );

      setDelivery(response.data.data);

      setShowPaymentModal(false);
    } catch (err) {
      console.error(err);

      setPaymentError(
        "Status pembayaran gagal diperbarui. Silakan coba lagi."
      );
    } finally {
      setUpdatingPayment(false);
    }
  };

  // =========================
  // Delete
  // =========================

  const handleOpenDeleteModal = () => {
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (deletingDelivery) {
      return;
    }

    setDeleteError(null);
    setShowDeleteModal(false);
  };

  const handleDeleteDelivery = async () => {
    if (!delivery) {
      return;
    }

    try {
      setDeletingDelivery(true);
      setDeleteError(null);

      await api.delete(
        `/deliveries/${delivery.id}`
      );

      setShowDeleteModal(false);

      navigate("/deliveries");
    } catch (err) {
      console.error(err);

      setDeleteError(
        "Data pengiriman gagal dihapus. Silakan coba lagi."
      );
    } finally {
      setDeletingDelivery(false);
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Truck
              size={20}
              className="text-slate-500"
            />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Memuat detail pengiriman...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error || !delivery) {
    return (
      <div>
        <Link
          to="/deliveries"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Kembali ke Pengiriman
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white">
            <Truck
              size={19}
              className="text-red-500"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-red-700">
            {error ??
              "Data pengiriman tidak ditemukan."}
          </p>

          <Link
            to="/deliveries"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Kembali ke Pengiriman
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // Status
  // =========================

  const isPaid =
    delivery.payment_status === "paid";

  const isCostPending =
    delivery.cost_status === "pending";

  const isCostConfirmed =
    delivery.cost_status === "confirmed";

  return (
    <div className="pb-8">
      {/* =========================
          Back
      ========================== */}

      <Link
        to="/deliveries"
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />

        Kembali ke Pengiriman
      </Link>

      {/* =========================
          Header
      ========================== */}

      <div className="mt-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Detail Pengiriman
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Pengiriman #{delivery.id}
              </h1>

              {/* Cost Status */}

              <span
                className={
                  isCostPending
                    ? "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                    : "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                }
              >
                <CircleDollarSign size={13} />

                {isCostPending
                  ? "Ongkos Pending"
                  : "Ongkos Ditentukan"}
              </span>

              {/* Payment Status */}

              <span
                className={
                  isPaid
                    ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                    : "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                }
              >
                {isPaid && <Check size={13} />}

                {isPaid
                  ? "Sudah Dibayar"
                  : "Belum Dibayar"}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={16} />

              <span>
                {formatDate(
                  delivery.delivery_date
                )}
              </span>
            </div>
          </div>

          {/* Delete Action */}

          <button
            type="button"
            onClick={handleOpenDeleteModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100 focus:ring-offset-2"
          >
            <Trash2 size={17} />

            Hapus Pengiriman
          </button>
        </div>
      </div>

      {/* =========================
          Main
      ========================== */}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* =========================
            Delivery Information
        ========================== */}

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                  <Truck
                    size={18}
                    className="text-slate-600"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Informasi Pengiriman
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Detail sopir, kendaraan, dan
                    pengiriman.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-7 sm:grid-cols-2">
                {/* Sopir */}

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <User
                      size={17}
                      className="text-slate-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Sopir
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-slate-900">
                      {delivery.driver.name}
                    </p>
                  </div>
                </div>

                {/* Kendaraan */}

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <Car
                      size={17}
                      className="text-slate-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Kendaraan
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-slate-900">
                      {delivery.vehicle.plate_number}
                    </p>
                  </div>
                </div>

                {/* Kode Truk */}

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <Truck
                      size={17}
                      className="text-slate-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Kode Truk
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-slate-900">
                      {delivery.vehicle.vehicle_code}
                    </p>
                  </div>
                </div>

                {/* Jumlah Rit */}

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <Package
                      size={17}
                      className="text-slate-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Jumlah Rit
                    </p>

                    <p className="mt-1.5 text-sm font-semibold text-slate-900">
                      {delivery.quantity} rit
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}

              <div className="mt-8 border-t border-slate-100 pt-7">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <Truck
                      size={17}
                      className="text-slate-500"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Keterangan
                    </p>

                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {delivery.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            Cost Summary
        ========================== */}

        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div
                  className={
                    isCostPending
                      ? "flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50"
                      : "flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50"
                  }
                >
                  <CircleDollarSign
                    size={18}
                    className={
                      isCostPending
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Ringkasan Ongkos
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Rincian biaya pengiriman.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Total */}

              <div
                className={
                  isCostPending
                    ? "rounded-xl border border-amber-200 bg-amber-50/70 p-5"
                    : "rounded-xl border border-emerald-200 bg-emerald-50/70 p-5"
                }
              >
                <p
                  className={
                    isCostPending
                      ? "text-xs font-semibold uppercase tracking-wide text-amber-700"
                      : "text-xs font-semibold uppercase tracking-wide text-emerald-700"
                  }
                >
                  Total Ongkos
                </p>

                <p
                  className={
                    isCostPending
                      ? "mt-2 text-xl font-bold tracking-tight text-amber-800"
                      : "mt-2 text-2xl font-bold tracking-tight text-emerald-800"
                  }
                >
                  {formatRupiah(
                    delivery.total_cost
                  )}
                </p>
              </div>

              {/* Detail */}

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Jumlah Rit
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {delivery.quantity} rit
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Ongkos / Rit
                  </span>

                  <span
                    className={
                      isCostPending
                        ? "text-sm font-medium text-slate-400"
                        : "text-sm font-semibold text-slate-900"
                    }
                  >
                    {formatRupiah(
                      delivery.unit_cost
                    )}
                  </span>
                </div>
              </div>

              {/* Cost Status */}

              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Status Ongkos
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={
                          isCostPending
                            ? "h-2 w-2 rounded-full bg-amber-500"
                            : "h-2 w-2 rounded-full bg-emerald-500"
                        }
                      />

                      <p
                        className={
                          isCostPending
                            ? "text-sm font-semibold text-amber-700"
                            : "text-sm font-semibold text-emerald-700"
                        }
                      >
                        {isCostPending
                          ? "Belum Ditentukan"
                          : "Sudah Ditentukan"}
                      </p>
                    </div>
                  </div>

                  {isCostConfirmed && (
                    <Check
                      size={18}
                      className="text-emerald-600"
                    />
                  )}
                </div>
              </div>

              {/* Cost Action */}

              <button
                type="button"
                onClick={handleOpenCostModal}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
              >
                <CircleDollarSign size={17} />

                {isCostPending
                  ? "Tentukan Ongkos"
                  : "Edit Ongkos"}
              </button>

              {/* Payment */}

              <div className="mt-7 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <CreditCard
                    size={16}
                    className={
                      isPaid
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  />

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status Pembayaran
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p
                    className={
                      isPaid
                        ? "text-sm font-semibold text-emerald-700"
                        : "text-sm font-semibold text-amber-700"
                    }
                  >
                    {isPaid
                      ? "Sudah Dibayar"
                      : "Belum Dibayar"}
                  </p>

                  <span
                    className={
                      isPaid
                        ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50"
                        : "flex h-7 w-7 items-center justify-center rounded-full bg-amber-50"
                    }
                  >
                    {isPaid ? (
                      <Check
                        size={15}
                        className="text-emerald-600"
                      />
                    ) : (
                      <CreditCard
                        size={15}
                        className="text-amber-600"
                      />
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Action */}

              {!isPaid && isCostConfirmed && (
                <button
                  type="button"
                  onClick={
                    handleOpenPaymentModal
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2"
                >
                  <Check size={17} />

                  Tandai Sudah Dibayar
                </button>
              )}

              {/* Payment Blocked */}

              {!isPaid && isCostPending && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="flex gap-2.5">
                    <CircleDollarSign
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <p className="text-xs leading-5 text-amber-700">
                      Tentukan ongkos terlebih dahulu
                      sebelum menandai pembayaran.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Completed */}

              {isPaid && (
                <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                    <Check
                      size={15}
                      className="text-emerald-600"
                    />
                  </div>

                  <p className="text-sm font-medium text-emerald-700">
                    Pembayaran sudah selesai
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          Cost Modal
      ========================== */}

      {showCostModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !updatingCost
            ) {
              handleCloseCostModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                    <CircleDollarSign
                      size={18}
                      className="text-amber-600"
                    />
                  </div>

                  <h2 className="text-base font-semibold text-slate-900">
                    {isCostPending
                      ? "Tentukan Ongkos"
                      : "Edit Ongkos"}
                  </h2>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {isCostPending
                    ? "Masukkan ongkos per rit untuk pengiriman ini."
                    : "Perbarui ongkos per rit untuk pengiriman ini."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseCostModal
                }
                disabled={updatingCost}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}

            <div className="px-6 py-6">
              {/* Summary */}

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Pengiriman
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    #{delivery.id}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Jumlah Rit
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {delivery.quantity} rit
                  </span>
                </div>
              </div>

              {/* Current Cost */}

              {!isCostPending &&
                delivery.unit_cost !== null && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-medium text-amber-700">
                        Ongkos saat ini
                      </span>

                      <span className="text-sm font-semibold text-amber-800">
                        {formatRupiah(
                          delivery.unit_cost
                        )}
                      </span>
                    </div>
                  </div>
                )}

              {/* Input */}

              <div className="mt-5">
                <label
                  htmlFor="unit-cost"
                  className="block text-sm font-medium text-slate-700"
                >
                  Ongkos per Rit
                </label>

                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-slate-400">
                    Rp
                  </span>

                  <input
                    id="unit-cost"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={costInput}
                    onChange={(event) => {
                      setCostInput(
                        event.target.value
                      );

                      if (costError) {
                        setCostError(null);
                      }
                    }}
                    disabled={updatingCost}
                    placeholder="Masukkan nominal"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Masukkan nominal ongkos untuk setiap
                  rit.
                </p>
              </div>

              {/* Total Preview */}

              {costInput !== "" &&
                Number.isFinite(
                  Number(costInput)
                ) &&
                Number(costInput) > 0 && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Perkiraan Total
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {delivery.quantity} rit ×{" "}
                          {formatRupiah(
                            Number(costInput)
                          )}
                        </p>
                      </div>

                      <p className="text-lg font-bold text-slate-900">
                        {formatRupiah(
                          Number(costInput) *
                            delivery.quantity
                        )}
                      </p>
                    </div>
                  </div>
                )}

              {/* Error */}

              {costError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {costError}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={
                  handleCloseCostModal
                }
                disabled={updatingCost}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleCostUpdate}
                disabled={
                  updatingCost ||
                  costInput.trim() === ""
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingCost ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check size={16} />

                    {isCostPending
                      ? "Simpan Ongkos"
                      : "Simpan Perubahan"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          Payment Modal
      ========================== */}

      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !updatingPayment
            ) {
              handleClosePaymentModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                    <Check
                      size={18}
                      className="text-emerald-600"
                    />
                  </div>

                  <h2 className="text-base font-semibold text-slate-900">
                    Tandai Sudah Dibayar
                  </h2>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Konfirmasi perubahan status
                  pembayaran.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleClosePaymentModal
                }
                disabled={updatingPayment}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}

            <div className="px-6 py-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Pengiriman
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    #{delivery.id}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Total Ongkos
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {formatRupiah(
                      delivery.total_cost
                    )}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                Pastikan pembayaran untuk pengiriman
                ini sudah dilakukan sebelum mengubah
                status menjadi{" "}
                <strong className="font-semibold text-slate-900">
                  Sudah Dibayar
                </strong>
                .
              </p>

              {paymentError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {paymentError}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={
                  handleClosePaymentModal
                }
                disabled={updatingPayment}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handlePaymentUpdate}
                disabled={updatingPayment}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingPayment ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Memproses...
                  </>
                ) : (
                  <>
                    <Check size={16} />

                    Konfirmasi Pembayaran
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          Delete Modal
      ========================== */}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deletingDelivery
            ) {
              handleCloseDeleteModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                    <Trash2
                      size={18}
                      className="text-red-600"
                    />
                  </div>

                  <h2 className="text-base font-semibold text-slate-900">
                    Hapus Pengiriman
                  </h2>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Apakah Anda yakin ingin menghapus
                  data pengiriman ini? Data yang sudah
                  dihapus tidak dapat dikembalikan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deletingDelivery}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}

            <div className="px-6 py-6">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Trash2
                    size={17}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Pengiriman #{delivery.id}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-700">
                      {delivery.driver.name} ·{" "}
                      {delivery.vehicle.plate_number}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-700">
                      {delivery.description}
                    </p>
                  </div>
                </div>
              </div>

              {deleteError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {deleteError}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deletingDelivery}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteDelivery}
                disabled={deletingDelivery}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingDelivery ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />

                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryDetail;
