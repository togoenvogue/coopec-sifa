import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  //console.log(Date.now());

  // no header found, implicitly, no token found
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(" ")[1];

  // header found, but token is missing not found
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }

  // token found, let verify it
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_HASH);

    if (!decodedToken) {
      req.isAuth = false;
      return next();
    }

    req.isAuth = true;
    req.userKey = decodedToken.userKey;
    req.username = decodedToken.username;
    req.email = decodedToken.email;
    req.authExpir = decodedToken.authExpir;
    next();
  } catch (error) {
    req.isAuth = false;
    return next();
  }
};
export default isAuth;
