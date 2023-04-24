import Icon from "../utilities/Icon.js"

/**
 * Create UI Buttons
 * @param color @type String - Color of the button
 * @param name @type String - name of the button
 * @param icon @type String - Icon name (from Material Symbols)
 * @param outline @type Boolean - Outlined or Filled
 * @param event @type Function - Any method signature
 * @param size @type String - `Tailwind` width class
 * @param disabled @type Boolean - True or False
 */
const Button = ({ color, name, icon, outline, event, size="fit", disabled }) => {
    
    let borderColor = "border-" + color + "-500", textColor = "text-" + color + "-500", bgColor = "bg-" + color + "-500", width = "w-" + size, bgHover = " hover:bg-" + color + "-600"
    
    return ( !disabled ?
        <div onClick={event} className={`flex ${width} mt-3 p-2 rounded-md justify-center cursor-pointer font-medium text-sm items-center ${outline ? textColor : "text-white"} border ${borderColor} ${outline ? "" : bgColor}${outline ? "" : bgHover}`}>
            { icon && <Icon name={icon}/> }
            <div className="px-1">{ name }</div>
        </div> :
        <div className={`flex ${width} mt-3 p-2 rounded-md justify-center text-sm font-medium items-center ${outline ? "text-slate-400" : "text-white"} border border-slate-400 ${outline ? "" : "bg-slate-400"}`}>
            { icon && <Icon name={icon}/> }
            <div className="px-1">{ name }</div>
        </div>
    )
}

export default Button