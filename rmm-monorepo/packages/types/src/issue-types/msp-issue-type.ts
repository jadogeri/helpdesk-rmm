export interface IMspIssueType {
  IssueTypeId: string;       
  Name: string;
  Description: string | null;
  RmReferenceId: string | null;
  CompanyId: string | null;
  ParentIssueTypeId?: string | null; 
}
