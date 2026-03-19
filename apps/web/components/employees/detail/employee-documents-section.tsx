"use client";

import { ExternalLink, FileText, Plus } from "lucide-react";
import type { EmployeeWithRelations } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { SectionIcon } from "@tbms/ui/components/section-icon";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";

interface EmployeeDocumentsSectionProps {
  documents: EmployeeWithRelations["documents"] | null | undefined;
  canManageDocuments: boolean;
  onOpenDocumentDialog: () => void;
}

export function EmployeeDocumentsSection({
  documents,
  canManageDocuments,
  onOpenDocumentDialog,
}: EmployeeDocumentsSectionProps) {
  return (
    <EmployeeSection
      id="employee-documents"
      title="Documents"
      description="Manage verification and identity documents for this employee."
      badge={
        <Badge variant="default" className="font-semibold">
          {documents?.length ?? 0} FILES
        </Badge>
      }
      action={
        canManageDocuments ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-full sm:w-auto"
            onClick={onOpenDocumentDialog}
          >
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        ) : null
      }
      defaultOpen
      collapsible={false}
    >
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
        {documents?.map((document) => (
          <InfoTile
            key={document.id}
            tone="default"
            padding="contentLg"
            layout="betweenGap"
            radius="xl"
            interaction="interactive"
          >
            <div className="flex items-center gap-4">
              <SectionIcon framed={false}>
                <FileText className="h-6 w-6 text-primary" />
              </SectionIcon>
              <div>
                <p className="text-sm font-bold">{document.label}</p>
                <p className="text-xs font-bold uppercase  text-muted-foreground">
                  {document.fileType}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              render={
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`Open ${document.label}`}
                  aria-label={`Open ${document.label}`}
                />
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </InfoTile>
        ))}

        {!documents || documents.length === 0 ? (
          <InfoTile
            borderStyle="dashedStrong"
            padding="none"
            radius="xl"
            className="col-span-1 flex flex-col items-center justify-center py-14 text-muted-foreground sm:col-span-2"
          >
            <FileText className="mb-3 h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">
              No documentation uploaded yet.
            </p>
          </InfoTile>
        ) : null}
      </div>
    </EmployeeSection>
  );
}
