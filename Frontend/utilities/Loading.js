import Image from "next/image"
import cog from "../public/cog.png"

const Loading = () => {

    return (
        <div className="relative w-full h-full border bg-white">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full">
                <div className="top-left-spin w-fit">
                    <Image width={100} height={100} src={cog} alt="cog"/>
                </div>
                <div className="bottom-right-spin w-fit -mt-10 ml-24">
                    <Image width={75} height={75} src={cog} alt="cog"/>
                </div>
            </div>
        </div>
    )
}

export default Loading