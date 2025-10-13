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

  const handleSetFiles = useCallback(
    (userfiles = []) => {
      const filesState = [...files, ...Array.from(userfiles)];
      let invalidFiles = [];
      const validFiles = filesState.filter((file) => {
        let isValid = file.type.includes(accept);

        if (!isValid) {
          invalidFiles.push(file);
        }

        return isValid;
      });

      if (invalidFiles.length > 0) {
        toast.error(
          `You can only upload files with the following extensions: ${accept}`
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
    [files, setFileInputValue, maxFiles, accept]
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
        hasFiles: files.length > 0,
        handleDeleteFile,
        handleClearFiles,
        maxFiles,
        handleOpenFileInput,
        accept,
        multiple,
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
    isDragging,
    maxFiles,
    handleOpenFileInput,
    accept,
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
