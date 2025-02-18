export type Media = {
  url: string;
  type: string;
};

export type Article = {
  id?: string;
  logo: string | File;
  body: string;
  datePosted: string;
  author: string;
  title: string;
  assets: Media[] | [];
  latest?: boolean;
  isHighlight: boolean;
};
