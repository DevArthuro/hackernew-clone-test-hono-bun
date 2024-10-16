export type SuccessResponse<T = void> = {
  success: boolean;
  message: string;
} & (T extends void ? {} : { data: T });

export type ErrorResponse = {
  success: boolean;
  error: string;
  isFormError?: boolean;
};
