// %{
//   "name" => item["name"],
//   "location" => item["location"],
//   "type" => item["type"],
//   "metadata" => item["metadata"],
//   "doc" => item["doc"],
//   "score" => score,
//   "grade" => grade,
//   "priority" => priority,
//   "roles" => roles
// }

export type CodeObject = {
  name: string;
  location: CodeObjectLocation;
  type: CodeObjectType;
  doc: string;
  metadata: CodeObjectMetadata;
};

export type CodeObjectWithRoles = CodeObject & { roles: CodeObjectRole[] };
export type CodeObjectWithRolesAndEvalutation = CodeObjectWithRoles & {
  priority: number;
  score: number;
  grade: CodeObjectGrade;
};

export type CodeObjectGrade = 'A' | 'B' | 'C' | 'U';

export type CodeObjectType = string;
export type CodeObjectMetadata = any;
export type CodeObjectRole = {
  id: string;
  metadata?: any;
};
export type CodeObjectLocation = {
  filename: string;
  line: number;
  column: number;
};
