export type ServerActionResponse<T> = {
  data: T | null;
  isError: boolean;
  error: string;
};

export type ServiceResponse<T> = {
  data: T | null;
  error: string | null;
};
