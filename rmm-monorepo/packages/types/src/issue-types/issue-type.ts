export interface IIssueType {
  id: string;       
  name: string;
  description: string | null;
  rmReferenceId: string | null;
  companyId: string | null;
  parentIssueTypeId?: string | null; 
}
