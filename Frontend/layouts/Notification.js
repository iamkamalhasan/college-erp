const Notification = ({ setNotify }) => {
    
    return (
        <div className="absolute bg-white top-12 right-14 border w-1/5 px-2 py-1 rounded-md shadow" onClick={() => setNotify(false)}>
            <div className="absolute w-5 h-5 border-t border-l rotate-45 bg-white right-4 -top-[10.5px] "></div>
            <div className="text-xs text-slate-400 px-1 pt-1">NOTIFICATION</div>
            <Item active/>
            <Item />
        </div>
    )
}

const Item = ({ active }) => {
    return (
        <div className={`my-1 p-2 rounded-md ${active ? "hover:bg-slate-50" : "grayscale"}`}>
            <div className="flex justify-between">
                <div className="text-xs text-blue-500">Academics</div>
                <div className="text-xs">12:34 PM</div>
            </div>
            <div className="text-xs mt-1">This is a sample notification item.</div>
        </div>
    )
}

export default Notification