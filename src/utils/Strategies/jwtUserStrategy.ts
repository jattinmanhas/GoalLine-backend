import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import { PassportStatic } from "passport";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../handlers/apiError";

const prisma = new PrismaClient();

const userSecret: string = process.env.CLIENT_SECRET as string;

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: userSecret,
};

const userJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    "jwt-user",
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
            where: {
                id: jwtPayload.id,
                role: jwtPayload.role
            }
        })

        if (!user) {
            return done(new ApiError(404, "User not found"), false);
        }

            return done(null, jwtPayload);
      } catch (err) {
        return done(new ApiError(500, "Internal Server Error"), false);
      }
    })
  );
};

export default userJwtStrategy;
