import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";
import { StatsCards } from "../components/dashboard/StatsCards";
import { DateRangeFilter } from "../components/dashboard/DateRangeFilter";
import { PendingWorkOrdersCard } from "../components/dashboard/PendingWorkOrdersCard";
import { ChartsSection } from "../components/dashboard/ChartsSection";

export function Dashboard() {
  const [dateFrom, setDateFrom] = useState(dashboardService.getFirstDayOfMonth());
  const [dateTo, setDateTo] = useState(dashboardService.getCurrentDate());
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("all");

  // Load data on mount and when filters change
  const [stats, setStats] = useState(dashboardService.getStats());
  const [analysisTypeData, setAnalysisTypeData] = useState(dashboardService.getAnalysisTypeData());
  const [monthlyTrendData, setMonthlyTrendData] = useState(dashboardService.getMonthlyTrendData());
  const [pendingWorkOrders, setPendingWorkOrders] = useState(dashboardService.getPendingWorkOrders());
  const [topCustomersData, setTopCustomersData] = useState(dashboardService.getTopCustomersData());
  const [dailyActivityData, setDailyActivityData] = useState(dashboardService.getDailyActivityData());

  useEffect(() => {
    // Refresh all dashboard data with filters (auto-refresh on filter change)
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

  return (
    <div className="space-y-6">
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        selectedAnalysisType={selectedAnalysisType}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onAnalysisTypeChange={setSelectedAnalysisType}
      />

      <StatsCards stats={stats} />

      <PendingWorkOrdersCard orders={pendingWorkOrders} />

      <ChartsSection
        analysisTypeData={analysisTypeData}
        monthlyTrendData={monthlyTrendData}
        topCustomersData={topCustomersData}
        dailyActivityData={dailyActivityData}
      />
    </div>
  );
}
