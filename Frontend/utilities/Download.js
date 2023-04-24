import Icon from "./Icon"
import { jsonToExcel } from "./helpers"

/**
 * Default download file component
 * @param data @type [Object] - Collection of documents
 * @param name @type String - Name of downloaded file
 */
const Download  = ({ data, name = "data" }) => {
    return (
        <div className="p-2 border cursor-pointer flex rounded-lg text-sm w-fit group" onClick={() => jsonToExcel(data, name)}>
            <Icon name="download"/>
            <div className="mt-0.5 ease-in duration-150 h-0 w-0 opacity-0 pointer-events-none group-hover:h-fit group-hover:w-fit group-hover:opacity-100 group-hover:ml-2">Download</div>
        </div>
    )
}

export default Download