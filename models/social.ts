export interface SocialModel {
  id?: string;
  eventDate: number;
  eventDescription: string;
  eventImage: string;
  eventLocation: string;
  eventName: string;
  usersLiked: Array<string>;
  owner: string;
}
