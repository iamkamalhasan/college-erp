import { useRouter } from "next/router"
import { useEffect } from "react"

const Cfa = () => {

    const router = useRouter()

    useEffect(() => { router.push('/cfa/attendance') }, [])

    return null
}

export default Cfa;