export type Equivalency = {
  college_name: string;
  department: string;
  community_college_course: string;
  uw_equivalent: string;
  uw_req: string;
  effective_date: string;
  foreign_language: number;
  current_course: number;
};

export type TooltipData = {
  x: number;
  y: number;
  data: string | null;
  visible: boolean;
};

export type Token = {
  text: string;
  type: "word" | "space" | "other";
};