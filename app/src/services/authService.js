import authApi from "./authApi";

export const loginMembership = async ({ username, password }) => {
  const response = await authApi.post("/auth/login-membership", {
    username,
    password,
  });
  return response.data;
};
