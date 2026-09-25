import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../services/dashboardService";
import { StatsCards } from "../components/dashboard/StatsCards";
import { DateRangeFilter } from "../components/dashboard/DateRangeFilter";
import { PendingWorkOrdersCard } from "../components/dashboard/PendingWorkOrdersCard";
import { ChartsSection } from "../components/dashboard/ChartsSection";

const DASHBOARD_CHARTS_ENABLED = false;

export function Dashboard() {
  const [dateFrom, setDateFrom] = useState(dashboardService.getFirstDayOfMonth());
  const [dateTo, setDateTo] = useState(dashboardService.getCurrentDate());
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("all");
  const [analysisTypeOptions, setAnalysisTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [dataReady, setDataReady] = useState(false);

  const [stats, setStats] = useState(dashboardService.getStats());
  const [analysisTypeData, setAnalysisTypeData] = useState(
    dashboardService.getAnalysisTypeData(),
  );
  const [monthlyTrendData, setMonthlyTrendData] = useState(
    dashboardService.getMonthlyTrendData(),
  );
  const [pendingWorkOrders, setPendingWorkOrders] = useState(
    dashboardService.getPendingWorkOrders(),
  );
  const [topCustomersData, setTopCustomersData] = useState(
    dashboardService.getTopCustomersData(),
  );
  const [dailyActivityData, setDailyActivityData] = useState(
    dashboardService.getDailyActivityData(),
  );

  const refreshDashboardMetrics = useCallback(() => {
    const options = dashboardService.getAnalysisTypeFilterOptions();
    setAnalysisTypeOptions(options);

    if (
      selectedAnalysisType !== "all" &&
      !options.some((option) => option.value === selectedAnalysisType)
    ) {
      setSelectedAnalysisType("all");
      return;
    }

    const filters = {
      dateFrom,
      dateTo,
      analysisType: selectedAnalysisType,
    };

    setStats(dashboardService.getStats(filters));
    setAnalysisTypeData(dashboardService.getAnalysisTypeData(filters));
    setMonthlyTrendData(dashboardService.getMonthlyTrendData(filters));
    setPendingWorkOrders(dashboardService.getPendingWorkOrders(filters));
    setTopCustomersData(dashboardService.getTopCustomersData(filters));
    setDailyActivityData(dashboardService.getDailyActivityData(filters));
  }, [dateFrom, dateTo, selectedAnalysisType]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setDataReady(false);
      try {
        await dashboardService.fetchDashboardSourceData(true);
      } catch {
        // Metrics still recompute from whatever data loaded successfully
      } finally {
        if (isMounted) setDataReady(true);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!dataReady) return;
    refreshDashboardMetrics();
  }, [dataReady, refreshDashboardMetrics]);

  return (
    <div className="space-y-6">
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        selectedAnalysisType={selectedAnalysisType}
        analysisTypeOptions={analysisTypeOptions}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onAnalysisTypeChange={setSelectedAnalysisType}
      />

      <StatsCards stats={stats} />

      <PendingWorkOrdersCard orders={pendingWorkOrders} />

      {DASHBOARD_CHARTS_ENABLED && (
        <ChartsSection
          analysisTypeData={analysisTypeData}
          monthlyTrendData={monthlyTrendData}
          topCustomersData={topCustomersData}
          dailyActivityData={dailyActivityData}
        />
      )}
    </div>
  );
}
