"use client";

import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { useState } from "react";
import {
  PageDescriptiveSection,
  PageSubdescription,
  PageTitle,
} from "@/components/invoice-ui/typography";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { useTraces } from "@/services/hooks/useBatchProcessInvoice";
import { InvoiceProcessingTable } from "@/components/common/invoice-processing-table";
import { InvoiceFilter } from "@/components/invoice-ui/invoice-filter";
import { FilterProvider } from "@/app/providers/filter-provider";
import { alwaysArray } from "@/lib/utils";
import { useSetSearchParams } from "@/hooks/use-set-search-params";

export default function Page() {
  const { params = {} } = useSetSearchParams();
  const [page, setPage] = useState(1);

  const { data: traces, isLoading } = useTraces({
    page: page,
    createdFrom: params.from || "",
    createdTo: params.to || "",
    status: alwaysArray(params.status || ""),
    batchNo: params.batchNo || "",
    filename: alwaysArray(params.filename || ""),
  });

  useSetBreadcrumbs([
    { title: "Home", url: APP_ROUTES.DASHBOARD },
    { title: "Monitor Traces", url: APP_ROUTES.PROCESSING.TRACE },
  ]);

  return (
    <FilterProvider>
      <PageContainers>
        <PageDescriptiveSection>
          <div className="flex justify-between items-center">
            <div>
              <PageTitle title="Monitor Traces" />
              <PageSubdescription subdescription="View all processing traces" />
            </div>
            <div>
              <InvoiceFilter />
            </div>
          </div>
        </PageDescriptiveSection>

        <InvoiceProcessingTable
          data={traces?.details || []}
          isLoading={isLoading}
          page={traces?.page - 1}
          totalItems={traces?.total}
          pageSize={traces?.size}
          enablePagination
          onPageChange={(newPage) => {
            setPage(newPage + 1);
          }}
          showBatchId
        />
      </PageContainers>
    </FilterProvider>
  );
}
