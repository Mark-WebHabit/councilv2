export type Media = {
  url: string;
  type: string;
};

export type Event = {
  content: string;
  media: Media[] | [];
  datePosted: string;
  type: string;
  isHighlight: boolean;
  eventDate: string;
};
