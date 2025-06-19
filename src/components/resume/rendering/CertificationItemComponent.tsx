"use client";

import { RenderableItem } from "@/types/schema";
import { Award, Calendar, Shield } from "lucide-react";

interface CertificationItemComponentProps {
  item: RenderableItem;
}

export const CertificationItemComponent = ({ item }: CertificationItemComponentProps) => {
  // Extract certification-specific fields
  const nameField = item.fields.find(f => f.key === 'name');
  const issuerField = item.fields.find(f => f.key === 'issuer');
  const dateField = item.fields.find(f => f.key === 'date');
  const expiryDateField = item.fields.find(f => f.key === 'expiryDate');
  const credentialIdField = item.fields.find(f => f.key === 'credentialId');
  const descriptionField = item.fields.find(f => f.key === 'description');

  // Format validity period - only if we have dates
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
            <p className="text-[10px] leading-[1.4] text-gray-700 mt-2 whitespace-pre-line">
              {Array.isArray(descriptionField.value) ? descriptionField.value.join(', ') : descriptionField.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 