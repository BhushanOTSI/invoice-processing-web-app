import { PageContainers } from "@/components/invoice-ui/page-containers";
import { PageDescriptiveSection } from "@/components/invoice-ui/typography";
import { PageTitle } from "@/components/invoice-ui/typography";
import { PageSubdescription } from "@/components/invoice-ui/typography";
import { FileProcessingForm } from "@/components/common/file-processing-form";

export default function NewProcessingPage() {
  return (
    <PageContainers>
      <PageDescriptiveSection>
        <PageTitle title="New Processing" />
        <PageSubdescription subdescription="Upload your files here" />
      </PageDescriptiveSection>
      <FileProcessingForm />
    </PageContainers>
  );
}
