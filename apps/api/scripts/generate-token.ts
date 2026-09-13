import jwt from "jsonwebtoken";

const token = jwt.sign(
  { sub: "advisor-1", role: "ADVISOR" },
  process.env.JWT_SECRET ?? "zenplus-dev-secret-change-me",
  { expiresIn: "1d" }
);

console.log(token);