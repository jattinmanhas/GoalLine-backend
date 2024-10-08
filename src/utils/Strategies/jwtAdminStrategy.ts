import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
  Strategy,
} from "passport-jwt";
import { PassportStatic } from "passport";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../handlers/apiError";

const prisma = new PrismaClient();

const adminSecret = process.env.ADMIN_SECRET as string;

const ops: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: adminSecret,
};

const jwtAdminStrategy = (passport: PassportStatic) => {
  passport.use(
    "jwt-admin",
    new Strategy(ops, async(jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            id: jwtPayload.id,
            role: jwtPayload.role,
          },
        });

        if (!user) {
          return done(new ApiError(404, "User not found"), false);
        }

        if (user.role === "ADMIN") {
          return done(null, jwtPayload);
        } else {
          return done(new ApiError(403, "Not Authorized"), false);
        }
      } catch (err) {
        return done(new ApiError(500, "Internal Server Error"), false);
      }
    })
  );
};

export default jwtAdminStrategy;
