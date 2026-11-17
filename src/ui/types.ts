/**
 * CALION Tools — UI Component Types
 */

export type ToolCategory =
  | 'Encoding & Formats'
  | 'Cryptography & Security'
  | 'Networking & Infrastructure'
  | 'Analysis & Inspection';

export interface ToolModule {
  id: string;
  title: string;
  category: ToolCategory;
  description: string;
  icon: string;
  render: (container: HTMLElement) => void;
  sampleAction?: () => void;
}
