export type Media = {
  url: string;
  type: string;
};

export type Event = {
  id: string;
  content: string;
  media: Media[] | [];
  datePosted: string;
  type: string;
  isHighlight: boolean;
  eventDate: string;
  likes: string[] | [];
  views: number;
};
