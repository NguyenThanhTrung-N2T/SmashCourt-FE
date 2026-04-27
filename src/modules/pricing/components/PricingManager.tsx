"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  fetchSystemPriceHistory,
  fetchResolvedSystemPrices,
  fetchResolvedBranchPrices,
  createSystemPrice,
  createBranchPrice
} from "@/src/api/pricing.api";
import { fetchBranches, fetchBranchCourtTypes } from "@/src/api/branch.api";
import type { CurrentPriceDto, EffectivePriceDto } from "@/src/shared/types/pricing.types";
import type { BranchDto, BranchCourtTypeDto } from "@/src/shared/types/branch.types";
import { useToast } from "@/src/shared/hooks/useToast";
import {
  transformApiData,
  transformCurrentApiData,
  transformEffectiveData,
  getHistory,
} from "../utils";
import type { PriceRow, TabId, VersionItem } from "../types";
import { UpdatePriceModal } from "./UpdatePriceModal";
import { CreateWizardModal } from "./CreateWizardModal";
import { ManageBranchCourtTypesModal } from "./ManageBranchCourtTypesModal";
import { PricingHeader } from "./PricingHeader";
import { PricingStats } from "./PricingStats";
import { PricingTabs } from "./PricingTabs";
import { PricingGridTab } from "./PricingGridTab";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import {
  CalendarDots,
  Clock,
  ClockCounterClockwise,
  Tag,
  Storefront,
  CaretDown,
  Warning,
  CheckCircle,
} from "@phosphor-icons/react";

function GridSkeleton() {
  return (
    <div className="rounded-4xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-200" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-3.5">
            <div className="h-7 w-7 rounded-lg bg-slate-100" />
            <div className="h-3.5 w-28 rounded bg-slate-100" />
            <div className="ml-auto h-3.5 w-16 rounded bg-slate-100" />
            <div className="h-3.5 w-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingManager() {
  const [tab, setTab] = useState<TabId>("system");
  const [selectedCourtType, setSelectedCourtType] = useState<string>("");
  const [selectedVersionDate, setSelectedVersionDate] = useState<string>("");

  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const [updateRow, setUpdateRow] = useState<PriceRow | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const [systemPrices, setSystemPrices] = useState<CurrentPriceDto[]>([]);
  const [resolvedSystemPrices, setResolvedSystemPrices] = useState<CurrentPriceDto[]>([]);
  const [resolvedBranchPrices, setResolvedBranchPrices] = useState<EffectivePriceDto[]>([]);

  const [branchCourtTypes, setBranchCourtTypes] = useState<BranchCourtTypeDto[]>([]);
  const [showManageCourtTypes, setShowManageCourtTypes] = useState(false);

  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sysPrices, branchesData] = await Promise.all([
          fetchSystemPriceHistory(),
          fetchBranches(1, 50),
        ]);

        setSystemPrices(sysPrices);
        setBranches(branchesData.items);

        if (sysPrices.length > 0) {
          const firstCtId = Array.from(new Map(sysPrices.map((p) => [p.courtTypeId, p])).keys())[0];
          setSelectedCourtType(firstCtId);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch pricing data";
        setError(message);
        showToast("error", message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Fetch resolved data when relevant state changes
  const fetchResolved = useCallback(async () => {
    if (!selectedVersionDate || !selectedCourtType) return;
    if (tab === "branch" && !selectedBranchId) return;

    try {
      setResolving(true);
      const sysData = await fetchResolvedSystemPrices(selectedVersionDate, selectedCourtType);
      setResolvedSystemPrices(sysData);

      if (tab === "branch" && selectedBranchId) {
        const branchData = await fetchResolvedBranchPrices(selectedBranchId, selectedVersionDate, selectedCourtType);
        setResolvedBranchPrices(branchData);
      }
    } catch (err) {
      showToast("error", "Failed to resolve prices");
    } finally {
      setResolving(false);
    }
  }, [tab, selectedVersionDate, selectedCourtType, selectedBranchId, showToast]);

  useEffect(() => {
    fetchResolved();
  }, [fetchResolved]);

  useEffect(() => {
    if (tab === "branch" && selectedBranchId) {
      fetchBranchCourtTypes(selectedBranchId)
        .then((data) => setBranchCourtTypes(data))
        .catch(() => showToast("error", "Lỗi tải danh sách loại sân chi nhánh"));
    } else {
      setBranchCourtTypes([]);
    }
  }, [tab, selectedBranchId, showToast]);

  const handleRefetchBranchCourtTypes = async () => {
    if (tab === "branch" && selectedBranchId) {
      try {
        const data = await fetchBranchCourtTypes(selectedBranchId);
        setBranchCourtTypes(data);
      } catch (err) {
        showToast("error", "Lỗi tải loại sân chi nhánh");
      }
    }
  };

  // Full history — used for version dropdown and stats only
  const {
    courtTypes: systemCourtTypes,
    timeSlots: systemTimeSlots,
    configs: systemConfigs,
  } = useMemo(() => transformApiData(systemPrices), [systemPrices]);

  const courtTypes = systemCourtTypes;
  const timeSlots = systemTimeSlots;

  const displayCourtTypes = useMemo(() => {
    if (tab === "system") {
      return systemCourtTypes;
    }
    const activeAtBranch = branchCourtTypes.filter(ct => ct.isActive);
    return systemCourtTypes.filter(sct => activeAtBranch.some(bct => bct.courtTypeId === sct.id));
  }, [tab, systemCourtTypes, branchCourtTypes]);

  useEffect(() => {
    if (selectedCourtType && !displayCourtTypes.find((c) => c.id === selectedCourtType)) {
      if (displayCourtTypes.length > 0) setSelectedCourtType(displayCourtTypes[0].id);
    }
  }, [displayCourtTypes, selectedCourtType]);

  // history = all versions for version dropdown (from full history data)
  const history = useMemo(() => {
    return getHistory(systemConfigs, selectedCourtType);
  }, [systemConfigs, selectedCourtType]);

  // Sync selected version
  useEffect(() => {
    if (history.length > 0 && !selectedVersionDate) {
      setSelectedVersionDate(history[0].effectiveFrom);
    } else if (history.length === 0) {
      setSelectedVersionDate("");
    }
  }, [history, selectedVersionDate]);

  // activeConfig is directly built from the resolved endpoints
  const activeConfig = useMemo(() => {
    if (tab === "system") {
      const map = transformCurrentApiData(resolvedSystemPrices);
      return map.get(selectedCourtType) ?? null;
    } else {
      const { configs } = transformEffectiveData(resolvedBranchPrices);
      const config = configs.get(selectedCourtType);
      if (!config) return null;

      const configCopy = { ...config, rows: [...config.rows] };
      const sysConfigMap = transformCurrentApiData(resolvedSystemPrices);
      const sysConfig = sysConfigMap.get(selectedCourtType) ?? null;

      if (sysConfig) {
        configCopy.rows = configCopy.rows.map(row => {
          if (row.priceSource === "BRANCH_OVERRIDE") {
            const sysRow = sysConfig.rows.find(r => r.slotId === row.slotId);
            if (sysRow) {
              return {
                ...row,
                systemWeekdayPrice: sysRow.weekdayPrice,
                systemWeekendPrice: sysRow.weekendPrice
              };
            }
          }
          return row;
        });
      }
      return configCopy;
    }
  }, [tab, resolvedSystemPrices, resolvedBranchPrices, selectedCourtType]);

  const isEditable = useMemo(() => {
    if (history.length === 0) return true;
    const latestDate = history[0].effectiveFrom;
    return selectedVersionDate >= latestDate;
  }, [history, selectedVersionDate]);

  const isBranchCourtTypeActive = useMemo(() => {
    if (tab === "system") return true;
    const bct = branchCourtTypes.find((ct) => ct.courtTypeId === selectedCourtType);
    return bct ? bct.isActive : false;
  }, [tab, branchCourtTypes, selectedCourtType]);

  const selectedCT = useMemo(() => {
    if (tab === "branch" && displayCourtTypes.length === 0) {
      return undefined;
    }
    return systemCourtTypes.find((c) => c.id === selectedCourtType) ?? displayCourtTypes[0];
  }, [tab, displayCourtTypes, selectedCourtType, systemCourtTypes]);

  const systemCurrentPriceCount = systemCourtTypes.filter(
    (ct) => transformCurrentApiData(systemPrices).has(ct.id),
  ).length;

  const stats = [
    { icon: Tag, label: "Loại sân", val: systemCourtTypes.length },
    { icon: Clock, label: "Khung giờ", val: systemTimeSlots.length },
    { icon: CalendarDots, label: "Bảng giá hiện hành", val: systemCurrentPriceCount },
    { icon: ClockCounterClockwise, label: "Tổng phiên bản (HT)", val: systemConfigs.length },
  ];

  const versions: VersionItem[] = history.map((c) => ({
    effectiveFrom: c.effectiveFrom,
    isCurrent: history.length > 0 && c.effectiveFrom === history[0].effectiveFrom,
  }));

  const handleUpdatePrice = async (patch: { applyAll: boolean; effectiveFrom: string; weekday: number; weekend: number }) => {
    try {
      if (!activeConfig) return;
      const pricesToSave = activeConfig.rows
        .filter(r => patch.applyAll || r.slotId === updateRow?.slotId)
        .map(r => ({
          startTime: r.startTime.length === 5 ? `${r.startTime}:00` : r.startTime,
          endTime: r.endTime.length === 5 ? `${r.endTime}:00` : r.endTime,
          weekdayPrice: patch.weekday,
          weekendPrice: patch.weekend
        }));

      const payload = {
        courtTypeId: selectedCourtType,
        effectiveFrom: patch.effectiveFrom.includes("T") ? patch.effectiveFrom : `${patch.effectiveFrom}T00:00:00`,
        prices: pricesToSave
      };

      if (tab === "system") {
        await createSystemPrice(payload);
        showToast("success", "Cập nhật bảng giá hệ thống thành công");
        const sysPrices = await fetchSystemPriceHistory();
        setSystemPrices(sysPrices);
        const sysData = await fetchResolvedSystemPrices(selectedVersionDate, selectedCourtType);
        setResolvedSystemPrices(sysData);
      } else if (tab === "branch" && selectedBranchId) {
        await createBranchPrice(selectedBranchId, payload);
        showToast("success", "Cập nhật bảng giá chi nhánh thành công");
        const branchData = await fetchResolvedBranchPrices(selectedBranchId, selectedVersionDate, selectedCourtType);
        setResolvedBranchPrices(branchData);
      }
      setUpdateRow(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      showToast("error", msg);
      if (tab === "branch") {
        handleRefetchBranchCourtTypes();
      }
    }
  };

  const handleCreatePrice = async (data: { courtTypeId: string; effectiveFrom: string; prices: any[] }) => {
    try {
      if (tab === "system") {
        await createSystemPrice(data);
        showToast("success", "Tạo bảng giá hệ thống thành công");
        const sysPrices = await fetchSystemPriceHistory();
        setSystemPrices(sysPrices);
        const sysData = await fetchResolvedSystemPrices(selectedVersionDate, selectedCourtType);
        setResolvedSystemPrices(sysData);
      } else if (tab === "branch" && selectedBranchId) {
        await createBranchPrice(selectedBranchId, data);
        showToast("success", "Tạo bảng giá chi nhánh thành công");
        const branchData = await fetchResolvedBranchPrices(selectedBranchId, selectedVersionDate, selectedCourtType);
        setResolvedBranchPrices(branchData);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      showToast("error", msg);
      if (tab === "branch") {
        handleRefetchBranchCourtTypes();
      }
      throw err;
    }
  };

  const handleOpenWizard = () => {
    if (tab === "branch" && !selectedBranchId) {
      showToast("error", "Vui lòng chọn chi nhánh trước khi tạo bảng giá");
      return;
    }
    if (tab === "branch" && displayCourtTypes.length === 0) {
      showToast("error", "Loại sân chưa được bật tại chi nhánh");
      return;
    }
    setShowWizard(true);
  };
  console.log(systemConfigs);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      <PricingHeader onCreateClick={handleOpenWizard} />

      <PricingStats stats={stats} />

      <PricingTabs
        activeTab={tab}
        onTabChange={setTab}
        courtTypes={displayCourtTypes}
        selectedCourtType={selectedCourtType}
        onCourtTypeChange={setSelectedCourtType}
        onManageCourtTypes={() => setShowManageCourtTypes(true)}
      />

      {tab === "branch" && (
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Storefront className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chọn chi nhánh ghi đè</p>
            <div className="relative mt-1">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm font-bold text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20"
              >
                <option value="" disabled>-- Chọn chi nhánh --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.status === "SUSPENDED" ? "(Tạm khóa)" : ""}
                  </option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      )}

      {tab === "branch" && !selectedBranchId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-4xl border border-slate-200 shadow-sm">
          <Storefront className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-700">Vui lòng chọn chi nhánh</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">Chọn một chi nhánh từ danh sách trên để xem hoặc cấu hình bảng giá ghi đè.</p>
        </div>
      ) : resolving ? (
        <GridSkeleton />
      ) : (
        <PricingGridTab
          selectedCT={selectedCT}
          currentConfig={activeConfig || null}
          isEditable={isEditable}
          versions={versions}
          selectedVersion={selectedVersionDate}
          onVersionChange={setSelectedVersionDate}
          onCreateClick={handleOpenWizard}
          onEditRow={setUpdateRow}
          onRefresh={fetchResolved}
          isCourtTypeActive={isBranchCourtTypeActive}
          onManageCourtTypes={() => setShowManageCourtTypes(true)}
        />
      )}

      {updateRow && (
        <UpdatePriceModal
          row={updateRow}
          onClose={() => setUpdateRow(null)}
          onSave={handleUpdatePrice}
        />
      )}

      {showWizard && (
        <CreateWizardModal
          onClose={() => setShowWizard(false)}
          courtTypes={tab === "system" ? systemCourtTypes : displayCourtTypes}
          timeSlots={timeSlots}
          onSave={handleCreatePrice}
        />
      )}

      {showManageCourtTypes && (
        <ManageBranchCourtTypesModal
          branchId={selectedBranchId}
          systemCourtTypes={systemCourtTypes}
          branchCourtTypes={branchCourtTypes}
          onClose={() => setShowManageCourtTypes(false)}
          onSuccess={handleRefetchBranchCourtTypes}
          showToast={showToast}
        />
      )}

      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${toast.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-4 shadow-2xl ${toast.tone === "success" ? "border-emerald-300" : "border-red-300"
            }`}
        >
          {toast.tone === "success" ? (
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          ) : (
            <Warning className="h-6 w-6 text-red-500" />
          )}
          <p className={`font-bold ${toast.tone === "success" ? "text-emerald-800" : "text-red-800"}`}>
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}