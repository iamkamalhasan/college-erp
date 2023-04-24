import { createContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import Cookies from "universal-cookie"
import axios from "../axios.config"

import "../styles/index.css"
import "@fontsource/montserrat"

import Layout from "../layouts/Layout"
import Canvas from "../layouts/Canvas"
import Authentication from "../auth/index"

export const AuthContext = createContext(null)
export const AppContext = createContext(null)

const fetchContext = async (params) => {

    try {

        let { data: user } = await axios.get("/auth/user", { params: params[0] })

        let { data: branches } = await axios.get("/admin/branch", { params: params[1] })

        let { data: metadata } = await axios.get("/admin/semestermeta", { params: params[2] })

        return { user, branches, metadata }

    }   catch(error) { return error }
}

const App = ({ Component, pageProps }) => {
    
    const router = useRouter()

    const cookies = new Cookies()

    let role = router.pathname.split("/")[1]

    const [ data, setData ] = useState(null)

    const [ auth, setAuth ] = useState({ status: false })

    const Auth = useMemo(() => ({ auth, setAuth }), [auth, setAuth])

    const Data = useMemo(() => ({ data, setData }), [data, setData])

    useEffect(() => {

        if(auth.status && auth.loaded) {

            let validRoute = role == "" || (auth.type == "Faculty" ? auth.roles.some((ele) => ele == role) : auth.primaryRole == role)

            if(!validRoute) router.push("/")

            return
        }

        if(auth.status) {

            fetchContext([ auth.user, {}, {} ])
                .then(({ user, branches, metadata }) => {

                    let validRoute = role == "", roles = [], available = [ "cfa", "hod", "fa", "ttc", "pc", "ci" ], type = user.userType

                    if(type == "Faculty")
                
                        for(let key of Object.keys(user))
                        
                            if(available.some(role => role == key) && user[key])
                                
                                roles.push(key)

                    validRoute ||= type == "Faculty" ? roles.some((ele) => ele == role) : type.toLowerCase() == role

                    if(!validRoute) router.push("/")
                        
                    setAuth({ status: true, loaded: true, primaryRole: (type == "Faculty" ? user.primaryRole : type).toLowerCase(), roles, type })

                    setData({ user, branches, metadata })
                    
                }).catch(err => alert(err.message))

        }   else {

            let token = cookies.get("gcterp")

            axios.get("/auth/token")
                .then(({ data }) => {

                    if(data.exists) setAuth({ status: true, loaded: false, user: data.user })
                    
                    else router.push("/")

                }).catch(err => console.log(err.message))
        }

    }, [ auth ])

    return (
        <AuthContext.Provider value={Auth}>
            { 
                auth.status ? (auth.loaded ? 
                
                <AppContext.Provider value={Data}>
                
                    <Layout profile={router.pathname.endsWith("/profile")}>
                
                        <Component {...pageProps} />
                
                    </Layout>
                
                </AppContext.Provider> : <Canvas />)
                
                : <Authentication /> 
            }
        </AuthContext.Provider>
    )
}

export default App