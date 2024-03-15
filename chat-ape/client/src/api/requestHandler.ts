import { AxiosResponse, AxiosError, AxiosInstance } from 'axios' 

interface SuccessRespone <V>{
    code : 200,
    data : AxiosResponse<V>
}

interface ErrorResponse <E>{
    code : 400,
    error : AxiosError<E>
}

type Response<V, E> = SuccessRespone<V> | ErrorResponse<E>

export async function requestHandler<V, E>(axios : AxiosInstance, endpoint : string) : Promise<Response<V, E>>{
    try {
        const response = await axios.get<AxiosResponse>(endpoint)
        return {
            code : 200,
            data : response.data
        }
    } catch (error) {
        return {
            code : 400,
            error : error as AxiosError<E>
        }
    }
}