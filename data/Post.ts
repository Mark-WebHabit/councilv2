export type Media = {
  url: string;
  type: string;
};

export type Post = {
  id: string;
  content: string;
  media: Media[] | [];
  datePosted: string;
  isHighlight: boolean;
  likes: string[] | [];
  views: number;
};
