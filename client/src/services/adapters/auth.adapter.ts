import type { IUserInput } from '@/types';

export interface SignUpRequestDto {
  phonenumber: string;
  displayname?: string;
  email: string;
  password: string;
}

export interface SignUpResponseDto {
  message: string;
}

export interface RegisterResult {
  message: string;
}

export function toSignUpRequestDto(input: IUserInput): SignUpRequestDto {
  const payload: SignUpRequestDto = {
    phonenumber: input.phonenumber,
    email: input.email.trim(),
    password: input.password,
  };

  if (input.displayname && input.displayname.trim().length > 0) {
    payload.displayname = input.displayname.trim();
  }

  return {
    ...payload,
  };
}

export function fromSignUpResponseDto(dto: SignUpResponseDto): RegisterResult {
  return {
    message: dto.message,
  };
}
