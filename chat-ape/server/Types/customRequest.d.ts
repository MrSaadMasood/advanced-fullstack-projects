import { Request } from 'express' 

interface CustomRequest extends Request {
    user? : JWTTokenPayload
    body : CreateNewUser
}