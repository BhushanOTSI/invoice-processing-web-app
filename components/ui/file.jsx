"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
import { UploadIcon } from "lucide-react";
import { Button } from "./button";

const FileInputContext = createContext();

const useFileInput = () => {
  const context = useContext(FileInputContext);
  if (!context) {
    throw new Error("useFileInput must be used within a FileInputProvider");
  }
  return context;
};

const FileInputProvider = ({
  children,
  maxFiles = 10,
  accept = "*",
  multiple = true,
  maxFileSize = 5 * 1024 * 1024,
  maxTotalSize = 25 * 1024 * 1024,
}) => {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const setFileInputValue = useCallback(
    (validFiles) => {
      const dataTransfer = new DataTransfer();
      validFiles.forEach((file) => dataTransfer.items.add(file));

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
    },
    [fileInputRef]
  );

  const handleClearFiles = useCallback(() => {
    setFiles([]);
    setFileInputValue([]);
  }, [setFileInputValue]);

  const handleDeleteFile = useCallback(
    (index) => {
      const filteredFiles = files.filter((_, i) =>
        Array.isArray(index) ? !index.includes(i) : i !== index
      );
      setFiles(filteredFiles);
      setFileInputValue(filteredFiles);
    },
    [files]
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSetFiles = useCallback(
    (userfiles = []) => {
      const filesState = [...files, ...Array.from(userfiles)];
      let invalidFiles = [];
      let oversizedFiles = [];
      let totalSize = 0;

      const validFiles = filesState.filter((file) => {
        let isValid = file.type.includes(accept);
        let isSizeValid = file.size <= maxFileSize;

        if (!isValid) {
          invalidFiles.push(file);
        }

        if (!isSizeValid) {
          oversizedFiles.push(file);
        }

        if (isValid && isSizeValid) {
          totalSize += file.size;
        }

        return isValid && isSizeValid;
      });

      // Check total size limit
      if (totalSize > maxTotalSize) {
        toast.error(
          `Total file size cannot exceed ${formatFileSize(
            maxTotalSize
          )}. Current total: ${formatFileSize(totalSize)}`
        );
        return;
      }

      if (invalidFiles.length > 0) {
        toast.error(
          `You can only upload files with the following extensions: ${accept}`
        );
      }

      if (oversizedFiles.length > 0) {
        toast.error(
          `Some files exceed the maximum size of ${formatFileSize(
            maxFileSize
          )}. Please reduce file size or remove them.`
        );
      }

      if (validFiles.length > maxFiles) {
        toast.error(
          `You can only upload ${maxFiles} files, automatically removed the oldest file`
        );
      }

      const filteredFiles = validFiles.slice(0, maxFiles);
      setFiles(filteredFiles);
      setFileInputValue(filteredFiles);
    },
    [files, setFileInputValue, maxFiles, accept, maxFileSize, maxTotalSize]
  );

  const handleChange = useCallback(
    (e) => {
      handleSetFiles(e.target.files);
    },
    [handleSetFiles]
  );

  const handleOnDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleOnDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleSetFiles(e.dataTransfer.files);
    },
    [handleSetFiles]
  );

  const handleOpenFileInput = useCallback(() => {
    fileInputRef.current.click();
  }, [fileInputRef]);

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const items = e.clipboardData.items;
      const files = Array.from(items)
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile());

      if (files.length > 0) {
        handleSetFiles(files);
      }
    },
    [handleSetFiles]
  );

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  return (
    <FileInputContext.Provider
      value={{
        files,
        setFiles,
        handleChange,
        fileInputRef,
        handleOnDrag,
        handleOnDragLeave,
        isDragging,
        handleDrop,
        handlePaste,
        hasFiles: files.length > 0,
        handleDeleteFile,
        handleClearFiles,
        maxFiles,
        handleOpenFileInput,
        accept,
        multiple,
        maxFileSize,
        maxTotalSize,
        formatFileSize,
        totalSize: getTotalSize(),
        remainingSize: maxTotalSize - getTotalSize(),
      }}
    >
      {children}
    </FileInputContext.Provider>
  );
};

const FileInput = ({ className }) => {
  const {
    handleOnDrag,
    handleOnDragLeave,
    handleDrop,
    handlePaste,
    isDragging,
    maxFiles,
    handleOpenFileInput,
    accept,
    maxFileSize,
    maxTotalSize,
    formatFileSize,
    totalSize,
    remainingSize,
  } = useFileInput();

  return (
    <div
      className={cn(
        "border-2 border-dashed bg-accent rounded-md transition-all",
        isDragging && "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ",
        className
      )}
      onDragOver={handleOnDrag}
      onDragLeave={handleOnDragLeave}
      onDrop={(e) => handleDrop(e)}
      onPaste={(e) => handlePaste(e)}
      onClick={handleOpenFileInput}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UploadIcon
              className={cn(isDragging && "text-blue-500 animate-bounce")}
            />
          </EmptyMedia>
          <EmptyTitle>
            Drag and drop your files here or click to upload.
          </EmptyTitle>
          <EmptyDescription>
            <div>
              You can upload up to <b>{maxFiles}</b> files.
            </div>
            <div>
              Allowed file types: <b>{accept}</b>
            </div>
            <div>
              Max file size: <b>{formatFileSize(maxFileSize)}</b>
            </div>
            <div>
              Total upload limit: <b>{formatFileSize(maxTotalSize)}</b>
            </div>
            {totalSize > 0 && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <div className="text-sm">
                  Current total: <b>{formatFileSize(totalSize)}</b>
                </div>
                <div className="text-sm">
                  Remaining: <b>{formatFileSize(remainingSize)}</b>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-1">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (totalSize / maxTotalSize) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" type="button">
            Browse files
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
};

function FileHiddenInput({ className, ...props }) {
  const { fileInputRef, handleChange, accept, multiple } = useFileInput();
  return (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleChange}
      multiple={multiple}
      className={"hidden"}
      accept={accept}
      {...props}
    />
  );
}

export {
  FileInputProvider,
  FileInputContext,
  FileInput,
  useFileInput,
  FileHiddenInput,
};
