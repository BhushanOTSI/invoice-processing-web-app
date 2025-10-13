"use client";

import { PageContainers } from "@/components/invoice-ui/page-containers";
import { PageDescriptiveSection } from "@/components/invoice-ui/typography";
import { PageTitle } from "@/components/invoice-ui/typography";
import { PageSubdescription } from "@/components/invoice-ui/typography";
import { FileProcessingForm } from "@/components/common/file-processing-form";
import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { APP_ROUTES } from "@/app/constants/app-routes";

export default function NewProcessingPage() {
  useSetBreadcrumbs([
    {
      title: "Home",
      url: APP_ROUTES.DASHBOARD,
    },
    { title: "New Processing", url: APP_ROUTES.PROCESSING.NEW },
  ]);

  return (
    <PageContainers>
      <PageDescriptiveSection>
        <PageTitle title="New Processing" />
        <PageSubdescription subdescription="Select files to process and update case type" />
      </PageDescriptiveSection>
      <FileProcessingForm />
    </PageContainers>
  );
}
