export class BasicAuthUser {
  username: string;
  authorities: string[];
  twoFaUser: boolean;
  password?: string;

  static emptyUser(): BasicAuthUser {
    return new BasicAuthUser();
  }
}
