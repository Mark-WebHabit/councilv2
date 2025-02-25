export type Media = {
  url: string;
  type: string;
};

export type Article = {
  id?: string;
  body: string;
  datePosted: string;
  title: string;
  assets: Media[] | [];
  latest?: boolean;
  isHighlight: boolean;
};
