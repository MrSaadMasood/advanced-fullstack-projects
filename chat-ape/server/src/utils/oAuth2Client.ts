import { OAuth2Client } from "google-auth-library";
import env from "../../zodSchema/envSchema";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET  } = env
const oAuth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "postmessage"
)

export default oAuth2Client