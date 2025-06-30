"use client";

import { RenderableItem, RoleMap } from "@/types/schema";
import { Shield, Calendar, Award } from "lucide-react";
import { pickFieldByRole } from "@/lib/roleMapUtils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface CertificationItemComponentProps {
  item: RenderableItem;
  roleMap?: RoleMap;
}

export const CertificationItemComponent = ({ item, roleMap }: CertificationItemComponentProps) => {
  const nameField = pickFieldByRole(item, 'title', roleMap);
  const issuerField = pickFieldByRole(item, 'organization', roleMap);
  const dateField = pickFieldByRole(item, 'startDate', roleMap);
  const expiryDateField = pickFieldByRole(item, 'endDate', roleMap);
  const credentialIdField = pickFieldByRole(item, 'identifier', roleMap);
  const descriptionField = pickFieldByRole(item, 'description', roleMap);

  const descriptionContent = descriptionField?.value ? 
    (Array.isArray(descriptionField.value) ? descriptionField.value.join(', ') : descriptionField.value) : '';

  const validityPeriod = (dateField?.value || expiryDateField?.value)
    ? `${dateField?.value || 'Obtained'}${expiryDateField?.value ? ` - ${expiryDateField.value}` : ''}`
    : null;
  
    return (
      <div className="mb-4 border-l-2 border-primary/20 pl-3">
        <div className="flex items-start gap-2">
          <Award size={14} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-grow">
            {nameField?.value && (
              <h4 className="font-semibold text-[12px] text-gray-800">
                {nameField.value}
              </h4>
            )}
            {issuerField?.value && (
              <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5">
                <Shield size={10} />
                {issuerField.value}
              </p>
            )}
            {validityPeriod && (
              <p className="text-[9px] text-gray-500 flex items-center gap-1 mt-0.5">
                <Calendar size={10} />
                {validityPeriod}
              </p>
            )}
            {credentialIdField?.value && (
              <p className="text-[9px] text-gray-400 mt-0.5">
                Credential ID: {credentialIdField.value}
              </p>
            )}
          {descriptionField?.value && (
            <>
              {descriptionField.markdownEnabled ? (
                <MarkdownRenderer className="text-[10px] text-gray-700 mt-2">
                  {descriptionContent}
                </MarkdownRenderer>
              ) : (
                <p className="text-[10px] leading-[1.4] text-gray-700 mt-2 whitespace-pre-line">
                  {descriptionContent}
                </p>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    );
  }; 