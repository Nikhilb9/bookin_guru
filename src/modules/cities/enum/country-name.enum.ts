export enum ECountryCode {
  PL = 'PL',
  DE = 'DE',
  ES = 'ES',
  FR = 'FR',
}

export const CountryNameMap: Record<ECountryCode, string> = {
  [ECountryCode.PL]: 'Poland',
  [ECountryCode.DE]: 'Germany',
  [ECountryCode.ES]: 'Spain',
  [ECountryCode.FR]: 'France',
};
