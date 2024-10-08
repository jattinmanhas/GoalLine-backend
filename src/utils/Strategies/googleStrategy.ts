import passport, { PassportStatic } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;


const googleStrategy = (passport: PassportStatic) => {
    console.log("google Strategy");
    passport.use("google", new GoogleStrategy({
        clientID: googleClientID as string,
        clientSecret: googleClientSecret as string,
        callbackURL: "user/auth/google/callback"
    }, async(accessToken, refreshToken, profile, done) => {
        console.log(accessToken);
        console.log(refreshToken);
        
    }))
}

export default googleStrategy