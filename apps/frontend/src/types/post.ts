export interface Post {
  id: number;
  title: string;
  body: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}
