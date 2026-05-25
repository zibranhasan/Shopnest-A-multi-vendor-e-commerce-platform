export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  phone?: string;
  isVerified: boolean;
  isActive: string;
}

export interface ISendOtp {
  email: string;
}

export interface IVerifyOtp {
  email: string;
  otp: string;
}

export interface ILogin {
  email: string;
  password: string;
}
