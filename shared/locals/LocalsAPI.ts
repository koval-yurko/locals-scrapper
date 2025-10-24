export type ListResponse<T> = {
  count: number;
  previous: string | null;
  next: string | null;
  results: T[];
};

export type Event = {
  event_city: string;
  data: {
    id: number;
    title: string;
    main_image_preview: string;
  };
};

export type ParticipantUser = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  avatar_picture: string;
};

export type Participant = {
  lot_id: string;
  user: ParticipantUser;
};

export type User = ParticipantUser & {
  age: number;
  gender: string;
  occupation: string;
  country: string;
  city: string;
  labels: {
    height: number;
  };
  description: string;
  share_link: string;
  linkedin_link: string;
  instagram_username: string;
};

export type UserPhoto = {
  id: number;
  image: string;
  is_main: boolean;
};

export type GetEventsRequest = {
  preset?: string;
  page?: number;
};

export type GetEventsResponse = ListResponse<Event>;

export type GetEventParticipantsRequest = {
  id: string;
  page?: number;
};

export type GetEventParticipantsResponse = ListResponse<Participant>;

export type GetUserRequest = {
  id: string;
};

export type GetUserResponse = User;

export type GetUserPhotosRequest = {
  id: string;
};

export type GetUserPhotosResponse = UserPhoto[];

export class LocalsAPI {
  private baseUrl: string;
  private accessToken: string;

  constructor(accessToken: string) {
    this.baseUrl = 'https://api.locals.org';
    this.accessToken = accessToken;
  }

  async getEvents(req?: GetEventsRequest): Promise<GetEventsResponse> {
    const { preset = 'saved', page = 1 } = req || {};
    const url = `/v1/users/self/account_page/events/?page=${page}&preset=${preset}`;
    return this.executeRequest(url);
  }

  async getEventParticipants(
    req: GetEventParticipantsRequest,
  ): Promise<GetEventParticipantsResponse> {
    const { id, page = 1 } = req || {};
    const url = `/v1/activities/${id}/participants/v2/?page=${page}`;
    return this.executeRequest(url);
  }

  async getUser(req: GetUserRequest): Promise<GetUserResponse> {
    const { id } = req || {};
    const url = `/v1/users/${id}/`;
    return this.executeRequest(url);
  }

  async getUserPhotos(
    req: GetUserPhotosRequest,
  ): Promise<GetUserPhotosResponse> {
    const { id } = req || {};
    const url = `/v1/users/${id}/photos`;
    return this.executeRequest(url);
  }

  private async executeRequest<T>(url: string, init?: RequestInit): Promise<T> {
    const headers = {
      Authorization: `Token ${this.accessToken}`,
      ...init?.headers,
    };
    const fullUrl = `${this.baseUrl}${url}`;
    const res = await fetch(fullUrl, {
      ...init,
      headers,
    });
    if (!res.ok) {
      const body = await res.json();
      console.error('Failed to fetch', fullUrl, body);
      throw new Error(res.statusText);
    }
    return await res.json();
  }
}
