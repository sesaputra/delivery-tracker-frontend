import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Edit3,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import axios from "axios";

import api from "../services/api";
import type {
  Driver,
  Vehicle,
} from "../types/delivery";

type DriverForm = {
  name: string;
  vehicle_id: string;
  phone: string;
  status: boolean;
};

type DriverResponse = {
  data: Driver;
};

type DriverListResponse = {
  data: Driver[];
};

type VehicleListResponse = {
  data: Vehicle[];
};

const initialForm: DriverForm = {
  name: "",
  vehicle_id: "",
  phone: "",
  status: true,
};

function Drivers() {
  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  /*
  |--------------------------------------------------------------------------
  | Loading & Error
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(true);

  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [saving, setSaving] = useState(false);

  const [changingStatus, setChangingStatus] =
    useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [vehicleError, setVehicleError] =
    useState<string | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("");

  const searchTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Modal
  |--------------------------------------------------------------------------
  */

  const [showModal, setShowModal] = useState(false);

  const [editingDriver, setEditingDriver] =
    useState<Driver | null>(null);

  const [form, setForm] =
    useState<DriverForm>(initialForm);

  /*
  |--------------------------------------------------------------------------
  | Success Message
  |--------------------------------------------------------------------------
  */

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Vehicles
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        setVehicleError(null);

        const response =
          await api.get<VehicleListResponse>(
            "/vehicles"
          );

        if (cancelled) {
          return;
        }

        setVehicles(response.data.data);
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        console.error(err);

        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data?.message;

          setVehicleError(
            message ??
              "Gagal mengambil data kendaraan."
          );
        } else {
          setVehicleError(
            "Gagal mengambil data kendaraan."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingVehicles(false);
        }
      }
    };

    fetchVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Fetch Drivers
  |--------------------------------------------------------------------------
  */

  const fetchDrivers = useCallback(
    async (searchValue = search) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        const trimmedSearch =
          searchValue.trim();

        if (trimmedSearch !== "") {
          params.set(
            "search",
            trimmedSearch
          );
        }

        const queryString =
          params.toString();

        const response =
          await api.get<DriverListResponse>(
            queryString
              ? `/drivers?${queryString}`
              : "/drivers"
          );

        setDrivers(
          response.data.data
        );
      } catch (err: unknown) {
        console.error(err);

        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data?.message;

          setError(
            message ??
              "Gagal mengambil data sopir."
          );
        } else {
          setError(
            "Gagal mengambil data sopir."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  /*
  |--------------------------------------------------------------------------
  | Search Effect
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(
        searchTimeoutRef.current
      );
    }

    searchTimeoutRef.current =
      setTimeout(() => {
        fetchDrivers(search);
      }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(
          searchTimeoutRef.current
        );
      }
    };
  }, [search, fetchDrivers]);

  /*
  |--------------------------------------------------------------------------
  | Open Add Modal
  |--------------------------------------------------------------------------
  */

  const handleOpenAddModal = () => {
    setEditingDriver(null);
    setForm(initialForm);
    setFormError(null);
    setSuccessMessage(null);
    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Open Edit Modal
  |--------------------------------------------------------------------------
  */

  const handleOpenEditModal = (
    driver: Driver
  ) => {
    setEditingDriver(driver);

    setForm({
      name: driver.name,
      vehicle_id: driver.vehicle_id
        ? String(driver.vehicle_id)
        : "",
      phone: driver.phone ?? "",
      status: driver.status ?? true,
    });

    setFormError(null);
    setSuccessMessage(null);
    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Modal
  |--------------------------------------------------------------------------
  */

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingDriver(null);
    setForm(initialForm);
    setFormError(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  const handleFormChange = (
    field: keyof DriverForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Submit Form
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError(
        "Nama sopir wajib diisi."
      );

      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      setSuccessMessage(null);

      const payload = {
        name: form.name.trim(),

        vehicle_id:
          form.vehicle_id !== ""
            ? Number(form.vehicle_id)
            : null,

        phone:
          form.phone.trim() !== ""
            ? form.phone.trim()
            : null,

        status: form.status,
      };

      if (editingDriver) {
        await api.put<DriverResponse>(
          `/drivers/${editingDriver.id}`,
          payload
        );

        setSuccessMessage(
          "Data sopir berhasil diperbarui."
        );
      } else {
        await api.post<DriverResponse>(
          "/drivers",
          payload
        );

        setSuccessMessage(
          "Sopir berhasil ditambahkan."
        );
      }

      setShowModal(false);
      setEditingDriver(null);
      setForm(initialForm);

      await fetchDrivers();
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message;

        setFormError(
          message ??
            "Data sopir gagal disimpan. Silakan coba lagi."
        );
      } else {
        setFormError(
          "Data sopir gagal disimpan. Silakan coba lagi."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Status
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus = async (
    driver: Driver
  ) => {
    try {
      setChangingStatus(driver.id);
      setError(null);
      setSuccessMessage(null);

      const nextStatus =
        !driver.status;

      await api.patch<DriverResponse>(
        `/drivers/${driver.id}/status`,
        {
          status: nextStatus,
        }
      );

      setSuccessMessage(
        nextStatus
          ? `${driver.name} berhasil diaktifkan.`
          : `${driver.name} berhasil dinonaktifkan.`
      );

      await fetchDrivers();
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message;

        setError(
          message ??
            "Status sopir gagal diperbarui."
        );
      } else {
        setError(
          "Status sopir gagal diperbarui."
        );
      }
    } finally {
      setChangingStatus(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reset Search
  |--------------------------------------------------------------------------
  */

  const handleResetSearch = () => {
    setSearch("");
  };

  /*
  |--------------------------------------------------------------------------
  | Formatting
  |--------------------------------------------------------------------------
  */

  const formatPhone = (
    phone: string | null
  ) => {
    if (!phone) {
      return "—";
    }

    return phone;
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Sopir
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Daftar sopir yang terdaftar di sistem.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
        >
          <Plus
            size={17}
            strokeWidth={2}
          />

          Tambah Sopir
        </button>
      </div>

      {/* Success */}
      {successMessage && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <Check
              size={17}
              strokeWidth={2}
            />

            <span>{successMessage}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage(null)
            }
            className="text-emerald-500 transition hover:text-emerald-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              strokeWidth={1.8}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Cari sopir, kendaraan, atau nomor telepon..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {search && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <RotateCcw
                size={16}
                strokeWidth={1.8}
              />

              Reset
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Error */}
      {vehicleError && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {vehicleError}
        </div>
      )}

      {/* API Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <UserRound
                size={20}
                className="text-slate-400"
              />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Memuat data sopir...
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          drivers.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <UserRound
                  size={20}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-700">
                Data sopir tidak ditemukan
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Coba gunakan kata kunci pencarian
                yang berbeda.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          drivers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {/* <th className="px-6 py-4 text-left font-medium text-slate-500">
                      ID
                    </th> */}

                    <th className="px-6 py-4 text-left font-medium text-slate-500">
                      Nama
                    </th>

                    <th className="px-6 py-4 text-left font-medium text-slate-500">
                      Kendaraan
                    </th>

                    <th className="px-6 py-4 text-left font-medium text-slate-500">
                      Telepon
                    </th>

                    <th className="px-6 py-4 text-center font-medium text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right font-medium text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {drivers.map(
                    (driver) => (
                      <tr
                        key={driver.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >
                        {/* ID */}
                        {/* <td className="px-6 py-4">
                          <span className="font-medium text-slate-500">
                            #{driver.id}
                          </span>
                        </td> */}

                        {/* Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                              <UserRound
                                size={17}
                                strokeWidth={1.8}
                                className="text-slate-500"
                              />
                            </div>

                            <div>
                              <p className="font-medium text-slate-900">
                                {driver.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="px-6 py-4">
                          {driver.vehicle ? (
                            <div>
                              <p className="font-medium text-slate-700">
                                {
                                  driver
                                    .vehicle
                                    .plate_number
                                }
                              </p>

                              {driver
                                .vehicle
                                .vehicle_code && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  {
                                    driver
                                      .vehicle
                                      .vehicle_code
                                  }
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              Belum ditentukan
                            </span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-4 text-slate-600">
                          {formatPhone(
                            driver.phone
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                driver
                              )
                            }
                            disabled={
                              changingStatus ===
                              driver.id
                            }
                            className={
                              driver.status
                                ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                : "inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                            }
                          >
                            {changingStatus ===
                            driver.id ? (
                              <Loader2
                                size={13}
                                className="animate-spin"
                              />
                            ) : (
                              <span
                                className={
                                  driver.status
                                    ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                    : "h-1.5 w-1.5 rounded-full bg-slate-400"
                                }
                              />
                            )}

                            {driver.status
                              ? "Aktif"
                              : "Nonaktif"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEditModal(
                                driver
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Edit3
                              size={15}
                              strokeWidth={1.8}
                            />

                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              handleCloseModal();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {editingDriver
                    ? "Edit Sopir"
                    : "Tambah Sopir"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingDriver
                    ? "Perbarui informasi sopir."
                    : "Tambahkan sopir baru ke sistem."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="driver-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nama Sopir
                  </label>

                  <input
                    id="driver-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleFormChange(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Contoh: Erik"
                    disabled={saving}
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {/* Vehicle */}
                <div>
                  <label
                    htmlFor="driver-vehicle"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Kendaraan
                  </label>

                  <div className="relative">
                    <Truck
                      size={17}
                      strokeWidth={1.8}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      id="driver-vehicle"
                      value={
                        form.vehicle_id
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "vehicle_id",
                          event.target.value
                        )
                      }
                      disabled={
                        saving ||
                        loadingVehicles
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">
                        {loadingVehicles
                          ? "Memuat kendaraan..."
                          : "Tidak ada kendaraan"}
                      </option>

                      {vehicles.map(
                        (vehicle) => (
                          <option
                            key={
                              vehicle.id
                            }
                            value={
                              vehicle.id
                            }
                          >
                            {
                              vehicle.plate_number
                            }

                            {vehicle.vehicle_code
                              ? ` — ${vehicle.vehicle_code}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Satu kendaraan hanya dapat
                    memiliki satu sopir default.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="driver-phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nomor Telepon

                    <span className="ml-1 font-normal text-slate-400">
                      (opsional)
                    </span>
                  </label>

                  <input
                    id="driver-phone"
                    type="text"
                    value={form.phone}
                    onChange={(event) =>
                      handleFormChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Contoh: 08123456789"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {/* Status */}
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Status
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleFormChange(
                          "status",
                          true
                        )
                      }
                      disabled={saving}
                      className={
                        form.status
                          ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition"
                          : "rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
                      }
                    >
                      <p
                        className={
                          form.status
                            ? "text-sm font-semibold text-emerald-700"
                            : "text-sm font-medium text-slate-600"
                        }
                      >
                        Aktif
                      </p>

                      <p
                        className={
                          form.status
                            ? "mt-0.5 text-xs text-emerald-600"
                            : "mt-0.5 text-xs text-slate-400"
                        }
                      >
                        Dapat digunakan
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleFormChange(
                          "status",
                          false
                        )
                      }
                      disabled={saving}
                      className={
                        !form.status
                          ? "rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-left transition"
                          : "rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
                      }
                    >
                      <p
                        className={
                          !form.status
                            ? "text-sm font-semibold text-slate-700"
                            : "text-sm font-medium text-slate-600"
                        }
                      >
                        Nonaktif
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Tidak digunakan
                      </p>
                    </button>
                  </div>
                </div>

                {/* Form Error */}
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {formError}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check
                        size={16}
                        strokeWidth={2}
                      />

                      {editingDriver
                        ? "Simpan Perubahan"
                        : "Simpan Sopir"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Drivers;

