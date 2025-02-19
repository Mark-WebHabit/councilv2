// Define TypeScript interfaces
export interface Reply {
  id: string;
  author: string;
  content: string;
  replies: Reply[]; // Recursive structure for nested replies
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  replies: Reply[];
}

export interface Confession {
  id: string;
  author: string;
  datePosted: string;
  content: string;
  comments: Comment[];
}
