export type User = {
  id: string;
  username: string;
  name?: string;
  surname?: string;
  profilePhoto?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InterestForm = {
  id?: string;
  name?: string;
  surname?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  gender?: string;
  profilePhoto?: string;
  user?: User;
};

export type ProfileData = {
  firstName: string;
  lastName: string;
  weight?: number;
  height?: number;
  dateOfBirth?: string;
  gender?: string;
  profilePhoto?: string;
};


