export interface RequestUserType {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  privileges: string[];
}

export type requestedUserType = RequestUserType;
