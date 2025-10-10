"use client";

import { APP_ROUTES } from "@/app/constants/app-routes";
import { InvoiceTable } from "@/components/common/invoice-table";
import { KpiCard } from "@/components/invoice-ui/kpi-card";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import {
  PageSubdescription,
  PageSubtitle,
} from "@/components/invoice-ui/typography";
import { PageDescriptiveSection } from "@/components/invoice-ui/typography";
import { Card } from "@/components/ui/card";
import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import {
  useDashboardStats,
  useRecentInvoices,
} from "@/services/hooks/useDashboard";
import { Calculator, Clock10, FileText } from "lucide-react";

export default function Page() {
  useSetBreadcrumbs([{ title: "Dashboard", url: APP_ROUTES.DASHBOARD }]);
  const { data, isLoading } = useDashboardStats();
  const { data: recentInvoices, isLoading: isLoadingRecentInvoices } =
    useRecentInvoices();

  return (
    <PageContainers>
      <div className="grid auto-rows-min gap-8 md:grid-cols-3">
        <KpiCard
          isLoading={isLoading}
          title={data?.invoiceProcessing?.title}
          value={data?.invoiceProcessing?.count}
          description={data?.invoiceProcessing?.description}
          icon={<FileText />}
        />
        <KpiCard
          isLoading={isLoading}
          title={data?.aiWorkHours?.title}
          value={data?.aiWorkHours?.count}
          description={data?.aiWorkHours?.description}
          icon={<Clock10 />}
        />
        <KpiCard
          isLoading={isLoading}
          title={data?.avgTimePerInvoice?.title}
          value={data?.avgTimePerInvoice?.count}
          description={data?.avgTimePerInvoice?.description}
          icon={<Calculator />}
        />
      </div>
      <div className="space-y-6">
        <PageDescriptiveSection>
          <PageSubtitle subtitle="Recent Invoices" />
          <PageSubdescription subdescription="View all recent invoices" />
        </PageDescriptiveSection>

        <Card className="p-0">
          <InvoiceTable
            data={recentInvoices}
            isLoading={isLoadingRecentInvoices}
            totalItems={recentInvoices?.length}
          />
        </Card>
      </div>
    </PageContainers>
  );
}
