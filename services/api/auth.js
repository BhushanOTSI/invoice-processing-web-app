import { BaseAPI } from "./baseAPI";

export class AuthAPI {
  static async login(username, password) {
    return BaseAPI.post(
      "/users/login",
      new URLSearchParams({
        username,
        password,
        grant_type: "password",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );
  }
}
