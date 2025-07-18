// // src/lib/migrateLegacyResume.ts deprecated

// import type { ResumeData, PersonalDetails } from '@/types/resume';
// import type {
//   DynamicResumeSection,
//   DynamicSectionItem,
//   ExtendedResumeData,
// } from '@/types/schema';

// /**
//  * Check if the resume data needs migration (is legacy format)
//  */
// export function needsMigration(data: any): boolean {
//   if (!data) return false;

//   // Check if it has schemaVersion - if yes, it's already migrated
//   if ('schemaVersion' in data) {
//     return false;
//   }

//   // Check if it has the legacy structure
//   return (
//     'personalDetails' in data &&
//     'sections' in data &&
//     Array.isArray(data.sections) &&
//     data.sections.some((s: any) => 'type' in s)
//   );
// }

// /**
//  * Migrate legacy resume data to extended format
//  */
// export function migrateLegacyResume(legacyData: any): ExtendedResumeData {
//   // If already migrated, return as-is
//   if ('schemaVersion' in legacyData) {
//     return legacyData as ExtendedResumeData;
//   }

//   const migratedSections: DynamicResumeSection[] = legacyData.sections.map(
//     (section: any) => {
//       const sectionType = section.type;
//       const dynamicSection: DynamicResumeSection = {
//         id: section.id,
//         schemaId: sectionType,
//         title: section.title,
//         visible: section.visible,
//         items: [],
//         metadata: {
//           customTitle: false,
//           aiOptimized: false,
//         },
//       };

//       // Convert items based on section type
//       if (section.items && Array.isArray(section.items)) {
//         dynamicSection.items = section.items.map((item: any) => {
//           const dynamicItem: DynamicSectionItem = {
//             id: item.id,
//             schemaId: sectionType,
//             data: {},
//             metadata: {
//               createdAt: new Date().toISOString(),
//               updatedAt: new Date().toISOString(),
//               aiGenerated: false,
//             },
//           };

//           // Copy all fields from the item to data
//           Object.keys(item).forEach((key) => {
//             if (key !== 'id') {
//               dynamicItem.data[key] = item[key];
//             }
//           });

//           return dynamicItem;
//         });
//       }

//       return dynamicSection;
//     }
//   );

//   const migratedData: ExtendedResumeData = {
//     personalDetails: legacyData.personalDetails as PersonalDetails,
//     sections: migratedSections,
//     templateId: legacyData.templateId,
//     schemaVersion: '1.0.0',
//     metadata: {
//       lastAIReview: new Date().toISOString(),
//       aiOptimizationLevel: 'basic',
//     },
//   };

//   return migratedData;
// }

// /**
//  * Migrate resume data if needed
//  * This is the main function to use in the app
//  */
// export function migrateLegacyResumeIfNeeded(data: any): ResumeData {
//   if (needsMigration(data)) {
//     console.log('Migrating legacy resume data to extended format...');
//     return migrateLegacyResume(data);
//   }
//   return data as ResumeData;
// }
