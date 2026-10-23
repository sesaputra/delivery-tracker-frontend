import { useEffect, useState } from "react";
import {
  Car,
  Check,
  Edit3,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import axios from "axios";

import api from "../services/api";
import type { Vehicle } from "../types/delivery";

type VehicleForm = {
  plate_number: string;
  vehicle_code: string;
  description: string;
  status: boolean;
};

type VehicleResponse = {
  data: Vehicle;
};

type VehicleListResponse = {
  data: Vehicle[];
};

type ModalMode = "create" | "edit" | null;

function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] =
    useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] =
    useState<ModalMode>(null);

  const [selectedVehicle, setSelectedVehicle] =
    useState<Vehicle | null>(null);

  const [form, setForm] = useState<VehicleForm>({
    plate_number: "",
    vehicle_code: "",
    description: "",
    status: true,
  });

  const [formError, setFormError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Vehicles
  |--------------------------------------------------------------------------
  */

  const fetchVehicles = async (
    searchValue: string
  ) => {
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
        await api.get<VehicleListResponse>(
          queryString
            ? `/vehicles?${queryString}`
            : "/vehicles"
        );

      setVehicles(response.data.data);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Gagal mengambil data kendaraan."
        );
      } else {
        setError(
          "Gagal mengambil data kendaraan."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search Effect
  |--------------------------------------------------------------------------
  |
  | Effect ini melakukan debounce 350ms.
  | Kita tidak memanggil fetchVehicles() secara
  | langsung di body effect untuk menghindari
  | warning cascading render dari React ESLint.
  |
  */

  useEffect(() => {
    const timeoutId =
      setTimeout(() => {
        void fetchVehicles(search);
      }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
  };

  const resetSearch = () => {
    setSearch("");
  };

  /*
  |--------------------------------------------------------------------------
  | Create Modal
  |--------------------------------------------------------------------------
  */

  const openCreateModal = () => {
    setSelectedVehicle(null);

    setForm({
      plate_number: "",
      vehicle_code: "",
      description: "",
      status: true,
    });

    setFormError(null);
    setModalMode("create");
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Modal
  |--------------------------------------------------------------------------
  */

  const openEditModal = (
    vehicle: Vehicle
  ) => {
    setSelectedVehicle(vehicle);

    setForm({
      plate_number:
        vehicle.plate_number ?? "",

      vehicle_code:
        vehicle.vehicle_code ?? "",

      description:
        vehicle.description ?? "",

      status: vehicle.status,
    });

    setFormError(null);
    setModalMode("edit");
  };

  /*
  |--------------------------------------------------------------------------
  | Close Modal
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalMode(null);
    setSelectedVehicle(null);
    setFormError(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  const handleFormChange = (
    field: keyof VehicleForm,
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

    setSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        plate_number:
          form.plate_number.trim(),

        vehicle_code:
          form.vehicle_code.trim() ||
          null,

        description:
          form.description.trim() ||
          null,

        status: form.status,
      };

      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      if (modalMode === "create") {
        const response =
          await api.post<VehicleResponse>(
            "/vehicles",
            payload
          );

        const newVehicle =
          response.data.data;

        setVehicles((current) => [
          newVehicle,
          ...current,
        ]);

        setSuccessMessage(
          "Kendaraan berhasil ditambahkan."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | EDIT
      |--------------------------------------------------------------------------
      */

      if (
        modalMode === "edit" &&
        selectedVehicle
      ) {
        const response =
          await api.put<VehicleResponse>(
            `/vehicles/${selectedVehicle.id}`,
            payload
          );

        const updatedVehicle =
          response.data.data;

        setVehicles((current) =>
          current.map((vehicle) =>
            vehicle.id ===
            selectedVehicle.id
              ? updatedVehicle
              : vehicle
          )
        );

        setSuccessMessage(
          "Data kendaraan berhasil diperbarui."
        );
      }

      setModalMode(null);
      setSelectedVehicle(null);
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        const responseMessage =
          err.response?.data?.message;

        const validationErrors =
          err.response?.data?.errors;

        if (
          validationErrors &&
          typeof validationErrors ===
            "object"
        ) {
          const firstError =
            Object.values(
              validationErrors as Record<
                string,
                string[]
              >
            )[0]?.[0];

          setFormError(
            firstError ??
              responseMessage ??
              "Data kendaraan tidak dapat disimpan."
          );
        } else {
          setFormError(
            responseMessage ??
              "Data kendaraan tidak dapat disimpan."
          );
        }
      } else {
        setFormError(
          "Data kendaraan tidak dapat disimpan."
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
    vehicle: Vehicle
  ) => {
    const nextStatus =
      !vehicle.status;

    setStatusUpdating(vehicle.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const response =
        await api.patch<VehicleResponse>(
          `/vehicles/${vehicle.id}/status`,
          {
            status: nextStatus,
          }
        );

      const updatedVehicle =
        response.data.data;

      setVehicles((current) =>
        current.map((item) =>
          item.id === vehicle.id
            ? updatedVehicle
            : item
        )
      );

      setSuccessMessage(
        nextStatus
          ? "Kendaraan berhasil diaktifkan."
          : "Kendaraan berhasil dinonaktifkan."
      );
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Status kendaraan gagal diperbarui."
        );
      } else {
        setError(
          "Status kendaraan gagal diperbarui."
        );
      }
    } finally {
      setStatusUpdating(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Master Data
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Kendaraan
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola data kendaraan yang digunakan
            dalam pengiriman.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={17} />

          Tambah Kendaraan
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Success Message                                                   */}
      {/* ---------------------------------------------------------------- */}

      {successMessage && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Check size={17} />

            {successMessage}
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage(null)
            }
            className="text-emerald-500 transition hover:text-emerald-700"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Error Message                                                     */}
      {/* ---------------------------------------------------------------- */}

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
            className="text-red-400 transition hover:text-red-600"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Search                                                            */}
      {/* ---------------------------------------------------------------- */}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value
                )
              }
              placeholder="Cari plat, kode, deskripsi, atau sopir..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={resetSearch}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw size={16} />

            Reset
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Table                                                             */}
      {/* ---------------------------------------------------------------- */}

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Daftar Kendaraan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {vehicles.length} kendaraan
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-slate-500">
              <Loader2
                size={17}
                className="animate-spin"
              />

              Memuat data kendaraan...
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            vehicles.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Car size={22} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  Tidak ada kendaraan
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Belum ada kendaraan yang
                  sesuai dengan pencarian Anda.
                </p>
              </div>
            )}

          {/* Table */}
          {!loading &&
            vehicles.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left font-medium text-slate-500">
                        Kendaraan
                      </th>

                      <th className="px-6 py-4 text-left font-medium text-slate-500">
                        Kode
                      </th>

                      <th className="px-6 py-4 text-left font-medium text-slate-500">
                        Sopir
                      </th>

                      <th className="px-6 py-4 text-left font-medium text-slate-500">
                        Deskripsi
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
                    {vehicles.map(
                      (vehicle) => (
                        <tr
                          key={vehicle.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                        >
                          {/* ------------------------------------------------ */}
                          {/* Vehicle                                            */}
                          {/* ------------------------------------------------ */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <Car
                                  size={19}
                                  strokeWidth={1.8}
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {
                                    vehicle.plate_number
                                  }
                                </p>

                                {/* <p className="mt-0.5 text-xs text-slate-400">
                                  ID #
                                  {
                                    vehicle.id
                                  }
                                </p> */}
                              </div>
                            </div>
                          </td>

                          {/* ------------------------------------------------ */}
                          {/* Vehicle Code                                      */}
                          {/* ------------------------------------------------ */}

                          <td className="px-6 py-4">
                            {vehicle.vehicle_code ? (
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {
                                  vehicle.vehicle_code
                                }
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                —
                              </span>
                            )}
                          </td>

                          {/* ------------------------------------------------ */}
                          {/* Driver                                            */}
                          {/* ------------------------------------------------ */}

                          <td className="px-6 py-4">
                            {vehicle.driver ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                                  <UserRound
                                    size={15}
                                  />
                                </div>

                                <div>
                                  <p className="font-medium text-slate-900">
                                    {
                                      vehicle
                                        .driver
                                        .name
                                    }
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    Sopir default
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">
                                Belum ada sopir
                              </span>
                            )}
                          </td>

                          {/* ------------------------------------------------ */}
                          {/* Description                                       */}
                          {/* ------------------------------------------------ */}

                          <td className="max-w-xs px-6 py-4">
                            <span className="line-clamp-2 text-slate-600">
                              {vehicle.description ||
                                "—"}
                            </span>
                          </td>

                          {/* ------------------------------------------------ */}
                          {/* Status                                            */}
                          {/* ------------------------------------------------ */}

                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  vehicle
                                )
                              }
                              disabled={
                                statusUpdating ===
                                vehicle.id
                              }
                              className="inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <span
                                className={
                                  vehicle.status
                                    ? "h-2 w-2 rounded-full bg-emerald-500"
                                    : "h-2 w-2 rounded-full bg-slate-300"
                                }
                              />

                              <span
                                className={
                                  vehicle.status
                                    ? "text-xs font-medium text-emerald-600"
                                    : "text-xs font-medium text-slate-400"
                                }
                              >
                                {statusUpdating ===
                                vehicle.id
                                  ? "Memproses..."
                                  : vehicle.status
                                    ? "Aktif"
                                    : "Nonaktif"}
                              </span>
                            </button>
                          </td>

                          {/* ------------------------------------------------ */}
                          {/* Actions                                           */}
                          {/* ------------------------------------------------ */}

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  vehicle
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Edit3 size={14} />

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
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Create / Edit Modal                                               */}
      {/* ---------------------------------------------------------------- */}

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* ------------------------------------------------------------ */}
            {/* Modal Header                                                   */}
            {/* ------------------------------------------------------------ */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  {modalMode ===
                  "create"
                    ? "Tambah Kendaraan"
                    : "Edit Kendaraan"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {modalMode ===
                  "create"
                    ? "Tambahkan kendaraan baru ke master data."
                    : "Perbarui informasi kendaraan."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Form                                                           */}
            {/* ------------------------------------------------------------ */}

            <form
              onSubmit={handleSubmit}
              className="px-6 py-6"
            >
              {/* Form Error */}
              {formError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div className="space-y-5">
                {/* -------------------------------------------------------- */}
                {/* Plate Number                                               */}
                {/* -------------------------------------------------------- */}

                <div>
                  <label
                    htmlFor="plate_number"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nomor Plat
                  </label>

                  <input
                    id="plate_number"
                    type="text"
                    value={
                      form.plate_number
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "plate_number",
                        event.target.value
                      )
                    }
                    placeholder="Contoh: DK 8325 HA"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* -------------------------------------------------------- */}
                {/* Vehicle Code                                               */}
                {/* -------------------------------------------------------- */}

                <div>
                  <label
                    htmlFor="vehicle_code"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Kode Kendaraan
                  </label>

                  <input
                    id="vehicle_code"
                    type="text"
                    value={
                      form.vehicle_code
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "vehicle_code",
                        event.target.value
                      )
                    }
                    placeholder="Contoh: TRUK-01"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* -------------------------------------------------------- */}
                {/* Description                                                */}
                {/* -------------------------------------------------------- */}

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Deskripsi
                  </label>

                  <textarea
                    id="description"
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Contoh: Kendaraan operasional pengiriman"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* -------------------------------------------------------- */}
                {/* Status                                                      */}
                {/* -------------------------------------------------------- */}

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Status kendaraan
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Kendaraan dapat digunakan
                        untuk pengiriman.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleFormChange(
                          "status",
                          !form.status
                        )
                      }
                      aria-label="Ubah status kendaraan"
                      className={
                        form.status
                          ? "relative h-6 w-11 rounded-full bg-emerald-500 transition"
                          : "relative h-6 w-11 rounded-full bg-slate-300 transition"
                      }
                    >
                      <span
                        className={
                          form.status
                            ? "absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition"
                            : "absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition"
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* Modal Footer                                                 */}
              {/* ---------------------------------------------------------- */}

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Menyimpan..."
                    : modalMode ===
                        "create"
                      ? "Simpan Kendaraan"
                      : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;
