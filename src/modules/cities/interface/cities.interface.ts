export interface ICity {
  name: string;
  country: string;
  pollution: number;
  description: string | null;
}

export interface ICitiesResponse {
  page: number;
  limit: number;
  total: number;
  cities: ICity[];
}
