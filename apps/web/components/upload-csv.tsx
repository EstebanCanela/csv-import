"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  createFile,
  exportFile,
  getPresignedUrl,
} from "@/shared/api/files/files.api";
import { v4 } from "uuid";
import {
  ExportFileRequestDto,
  ProcessFileResponseDto,
} from "@/shared/api/files/files.api.model";
import { useRouter } from "next/navigation";

type Step = "upload" | "map" | "review";

interface CsvColumn {
  name: string;
  sampleData: string;
}

interface DestinationColumn {
  id: string;
  label: string;
  required: boolean;
}

export default function UploadCSV() {
  const [userId] = useState(() => v4());
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [mapStepError, setMapStepError] = useState<string | null>(null);
  const [csvColumns, setCSVColumns] = useState<CsvColumn[]>([]);
  const [destinationColumns, setDestinationColumns] = useState<
    DestinationColumn[]
  >([]);
  const [fileCreationResponse, setFileCreationResponse] =
    useState<ProcessFileResponseDto | null>(null);

  const steps: { id: Step; label: string }[] = [
    { id: "upload", label: "Upload" },
    { id: "map", label: "Map Columns" },
    { id: "review", label: "Review" },
  ];

  const [columnMappings, setColumnMappings] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const initialMappings: Record<string, string> = {};
    const usedDestinations: string[] = [];

    csvColumns.forEach((column) => {
      const matchingDestination = destinationColumns.find(
        (dest) =>
          dest.id.toLowerCase() === column.name.toLowerCase() &&
          !usedDestinations.includes(dest.id)
      );

      let selectedDestination: DestinationColumn | undefined;
      if (matchingDestination) {
        selectedDestination = matchingDestination;
      } else {
        selectedDestination = destinationColumns.find(
          (dest) => !usedDestinations.includes(dest.id)
        );
      }

      if (selectedDestination) {
        initialMappings[column.name] = selectedDestination.id;
        usedDestinations.push(selectedDestination.id);

        if (selectedDestination.required) {
          setIncludedColumns((prev) => ({
            ...prev,
            [column.name]: true,
          }));
        }
      } else {
        initialMappings[column.name] = "";
      }
    });

    setColumnMappings(initialMappings);
  }, [destinationColumns, csvColumns]);

  const [includedColumns, setIncludedColumns] = useState(() => {
    return csvColumns.reduce(
      (acc, column) => {
        acc[column.name] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile &&
        (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))
      ) {
        setFile(droppedFile);
        handleFileUpload(droppedFile);
      } else {
        setUploadError("Please upload a CSV file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile &&
        (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))
      ) {
        setFile(selectedFile);
        handleFileUpload(selectedFile);
      } else {
        setUploadError("Please upload a CSV file");
      }
    }
  };

  const uploadFileToS3 = async (
    file: File,
    presignedUrl: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error("Failed to upload file to S3"));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Failed to upload file to S3"));
      };

      xhr.send(formData);
    });
  };

  const handleFileUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const presignedUrlResponse = await getPresignedUrl(
        fileToUpload.name,
        userId
      );

      await uploadFileToS3(fileToUpload, presignedUrlResponse.url);

      const createFileResponse = await createFile(
        fileToUpload.name,
        fileToUpload.type,
        fileToUpload.size,
        userId
      );

      setFileCreationResponse(createFileResponse);

      const csvColumnsBatch: CsvColumn[] = createFileResponse.headers.map(
        (element) => ({
          name: element,
          sampleData: (createFileResponse?.first_row[element] as string) || "",
        })
      );

      const destinationColumnsBatch: DestinationColumn[] =
        createFileResponse.configuration.map((element) => ({
          id: element.field,
          label: element.field,
          required: element.required,
        }));

      setCSVColumns(csvColumnsBatch);
      setDestinationColumns(destinationColumnsBatch);
      setUploadSuccess(true);
      setIsUploading(false);
      setCurrentStep("map");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setIsUploading(false);
    }
  };

  const renderUploadStep = () => {
    return (
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center h-96 transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-700 hover:border-gray-500",
          isUploading ? "pointer-events-none" : "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">
              Uploading... {uploadProgress}%
            </p>
          </div>
        ) : uploadError ? (
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-red-500">{uploadError}</p>
            <button
              className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setUploadError(null);
              }}
            >
              Try Again
            </button>
          </div>
        ) : file && uploadSuccess ? (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-green-500">Upload successful!</p>
            <p className="text-sm text-gray-400">{file.name}</p>
          </div>
        ) : (
          <>
            <FileUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-center text-gray-400">
              Drop files here or{" "}
              <span className="text-blue-500">browse files</span>
            </p>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    );
  };

  const renderMapStep = () => {
    const getAvailableDestinations = (currentColumnName: string) => {
      const usedDestinations = Object.entries(columnMappings)
        .filter(([colName]) => colName !== currentColumnName)
        .map(([, destId]) => destId)
        .filter((destId) => destId !== "");

      return destinationColumns.filter(
        (dest) => !usedDestinations.includes(dest.id)
      );
    };

    const handleMappingChange = (columnName: string, destinationId: string) => {
      const selectedDestination = destinationColumns.find(
        (dest) => dest.id === destinationId
      );

      setColumnMappings((prev) => {
        const newMappings = { ...prev };

        const previousColumn = Object.keys(newMappings).find(
          (col) => col !== columnName && newMappings[col] === destinationId
        );

        if (previousColumn) {
          newMappings[previousColumn] = "";
        }

        newMappings[columnName] = destinationId;

        return newMappings;
      });

      if (selectedDestination?.required) {
        setIncludedColumns((prev) => ({
          ...prev,
          [columnName]: true,
        }));
      }
    };

    const handleIncludeChange = (columnName: string, included: boolean) => {
      const destinationId = columnMappings[columnName];
      const destination = destinationColumns.find(
        (dest) => dest.id === destinationId
      );

      if (!included && destination?.required) {
        return;
      }

      setIncludedColumns((prev) => ({
        ...prev,
        [columnName]: included,
      }));
    };

    const validateRequiredMappings = () => {
      const requiredDestinations = destinationColumns
        .filter((dest) => dest.required)
        .map((dest) => dest.id);

      const mappedDestinations = Object.values(columnMappings).filter(
        (destId) => destId !== ""
      );

      const unmappedRequired = requiredDestinations.filter(
        (reqDest) => !mappedDestinations.includes(reqDest)
      );

      return unmappedRequired;
    };

    return (
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 bg-black text-white p-4 border-b border-gray-800">
          <div className="font-medium">Your File Column</div>
          <div className="font-medium">Your Sample Data</div>
          <div className="font-medium">Destination Column</div>
          <div className="font-medium text-center">Include</div>
        </div>

        <div className="divide-y divide-gray-800">
          {csvColumns.map((column) => {
            const availableDestinations = getAvailableDestinations(column.name);
            const currentMapping = columnMappings[column.name];
            const mappedDestination = destinationColumns.find(
              (dest) => dest.id === currentMapping
            );
            const isRequired = mappedDestination?.required || false;

            const dropdownOptions = [
              ...destinationColumns.filter(
                (dest) =>
                  !Object.values(columnMappings)
                    .filter(
                      (_, index) => csvColumns[index]?.name !== column.name
                    )
                    .includes(dest.id) || dest.id === currentMapping
              ),
            ];

            return (
              <div
                key={column.name}
                className="grid grid-cols-4 p-4 items-center"
              >
                <div className="text-white">{column.name}</div>
                <div className="text-white font-mono text-sm truncate">
                  {column.sampleData}
                </div>
                <div>
                  <div className="relative">
                    <select
                      value={columnMappings[column.name] || ""}
                      onChange={(e) =>
                        handleMappingChange(column.name, e.target.value)
                      }
                      className="w-full bg-black text-white border border-gray-700 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Remove one</option>
                      {dropdownOptions.map((dest) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={includedColumns[column.name]}
                    onChange={(e) =>
                      handleIncludeChange(column.name, e.target.checked)
                    }
                    disabled={isRequired}
                    className={cn(
                      "h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-700 rounded",
                      isRequired && "cursor-not-allowed opacity-50"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-end space-x-4 p-4 border-t border-gray-800">
          {mapStepError && (
            <div className="text-red-500 text-sm">{mapStepError}</div>
          )}
          <button
            className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors text-white"
            onClick={() => setCurrentStep("upload")}
          >
            Back
          </button>
          <button
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-white"
            onClick={() => {
              const hasDuplicates = Object.values(columnMappings).some(
                (destId, index, arr) => destId && arr.indexOf(destId) !== index
              );

              if (hasDuplicates) {
                setUploadError(
                  "Each destination column must be unique. Please adjust your mappings."
                );
                return;
              }

              const unmappedRequired = validateRequiredMappings();
              if (unmappedRequired.length) {
                setMapStepError(
                  `The following required destination columns are not mapped: ${unmappedRequired.join(
                    ", "
                  )}. Please map all required fields.`
                );
                return;
              }

              setCurrentStep("review");
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    const submitFile = async () => {
      const requestBody: ExportFileRequestDto = {
        configuration: Object.entries(columnMappings).map(
          ([csvColumn, destColumn]) => ({
            field: destColumn,
            value: csvColumn,
          })
        ),
      };

      const data = await exportFile(
        fileCreationResponse?.id || "",
        requestBody
      );

      if (data) {
        router.push(`/contacts?userId=${userId}`);
      }
    };

    return (
      <div className="border-2 border-gray-700 rounded-lg p-12 flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold mb-4">Review</h2>
        <p className="text-gray-400">Review interface would go here</p>
        <div className="flex space-x-4 mt-8">
          <button
            className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            onClick={() => setCurrentStep("map")}
          >
            Back
          </button>
          <button
            className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            onClick={submitFile}
          >
            Confirm
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Resend</h1>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2",
                  currentStep === step.id
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-600 text-gray-400"
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "ml-2",
                  currentStep === step.id ? "text-white" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-24 h-0.5 mx-2 bg-gray-700"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === "upload" && renderUploadStep()}
      {currentStep === "map" && renderMapStep()}
      {currentStep === "review" && renderReviewStep()}
    </div>
  );
}
