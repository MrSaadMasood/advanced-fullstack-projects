import { AxiosInstance } from 'axios' 

export async function requestHandler(axios : AxiosInstance, endpoint : string, optionsSelected : number) {
    try {
        const response = await axios.get(endpoint)
        return response.data
    } catch (error) {
        console.log(`request handler failed`, optionsSelected, error as Error)
    }
}