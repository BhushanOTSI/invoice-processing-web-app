"use client";

import { useInvoiceTrace } from "@/services/hooks/useInvoice";
import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { InvoiceTable } from "@/components/common/invoice-table";
import { useState } from "react";
import {
  PageDescriptiveSection,
  PageSubdescription,
  PageTitle,
} from "@/components/invoice-ui/typography";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { Card } from "@/components/ui/card";

export default function Page() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const { data: invoices, isLoading } = useInvoiceTrace({
    page: page,
    ...filters,
  });

  useSetBreadcrumbs([
    { title: "Processing Trace", url: APP_ROUTES.PROCESSING.TRACE },
  ]);

  return (
    <PageContainers>
      <PageDescriptiveSection>
        <PageTitle title="Processing Trace" />
        <PageSubdescription subdescription="View all processing traces" />
      </PageDescriptiveSection>

      <Card className="p-0">
        <InvoiceTable
          data={invoices?.data || []}
          isLoading={isLoading}
          page={invoices?.page - 1}
          totalItems={invoices?.total}
          pageSize={invoices?.pageSize}
          enablePagination
          onPageChange={(newPage) => {
            setPage(newPage + 1);
          }}
          onFilterChange={(filters = []) => {
            const filterObj = filters.reduce((acc, filter) => {
              acc[filter.id] = filter.value;
              return acc;
            }, {});

            setFilters(filterObj);
          }}
        />
      </Card>
    </PageContainers>
  );
}
