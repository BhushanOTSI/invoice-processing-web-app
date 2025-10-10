"use client";

import {
  FileHiddenInput,
  FileInput,
  FileInputProvider,
  useFileInput,
} from "@/components/ui/file";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../invoice-ui/data-table";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { humanizeFileSize } from "@/lib/utils";
import { PlayIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { ButtonGroup } from "../ui/button-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

export function FileProcessingForm() {
  return (
    <FileInputProvider maxFiles={10} accept="application/pdf">
      <FileProcessingFormContent />
    </FileInputProvider>
  );
}

export function FileProcessingFormContent() {
  const { files, handleDeleteFile, handleClearFiles, handleOpenFileInput } =
    useFileInput();
  const [filesToProcess, setFilesToProcess] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    setFilesToProcess(
      files.map((file, index) => ({
        file,
        isSelected: false,
        caseType: "case1",
        index,
      }))
    );
  }, [files]);

  const columns = useMemo(() => {
    return [
      {
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          );
        },
        isPlaceholder: true,
        rowClassName: "w-10",
        accessorKey: "isSelected",
        cell: ({ row }) => {
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          );
        },
      },
      {
        header: "File Name",
        accessorKey: "file.name",
      },
      {
        header: "File Size",
        accessorKey: "file.size",
        cell: ({ row }) => {
          return <span>{humanizeFileSize(row.original.file.size)}</span>;
        },
      },
      {
        header: "Case Type",
        accessorKey: "caseType",
        cell: ({ row }) => {
          return (
            <CaseTypeSelect
              defaultValue={row.original.caseType}
              onValueChange={(value) => {
                row.original.caseType = value;
              }}
            />
          );
        },
      },
      {
        header: "Action",
        accessorKey: "action",
        rowClassName: "w-10 text-center",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <Button
              size={"sm"}
              className={"h-7 cursor-pointer"}
              onClick={() => handleDeleteFile(row.index)}
              variant="destructive"
              type="button"
            >
              <XIcon />
              Remove
            </Button>
          );
        },
      },
    ];
  }, [handleDeleteFile]);

  return (
    <div>
      <FileHiddenInput />
      {files.length > 0 ? (
        <Card className={"pb-0 gap-0"}>
          <CardHeader className={"border-b"}>
            <CardTitle>Update Case Type</CardTitle>
            <CardDescription>Uploaded {files.length} file</CardDescription>
            <CardAction>
              <ButtonGroup>
                <ButtonGroup>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleClearFiles();
                      setRowSelection({});
                    }}
                  >
                    <XIcon />
                    Clear all
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenFileInput}
                  >
                    <PlusIcon />
                    Add More
                  </Button>
                </ButtonGroup>
                <ButtonGroup>
                  <Button variant="outline" size="sm">
                    <PlayIcon />
                    Process
                  </Button>
                </ButtonGroup>
              </ButtonGroup>
            </CardAction>
          </CardHeader>
          <CardContent className={"p-0"}>
            <DataTable
              columns={columns}
              data={filesToProcess}
              enablePagination={false}
              onRowSelectionChange={setRowSelection}
              rowSelection={rowSelection}
            />
          </CardContent>
        </Card>
      ) : (
        <FileInput />
      )}
    </div>
  );
}

export function CaseTypeSelect(props) {
  return (
    <Select {...props}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Case Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="case1">
          Invoice issued with Multiple Tax rate - ESAN
        </SelectItem>
        <SelectItem value="case2">Split invoice processing - ESAN</SelectItem>
        <SelectItem value="case3">Non-PO Exception Processing</SelectItem>
      </SelectContent>
    </Select>
  );
}
