import validator from "validator"
import * as XLSX from "xlsx"

const keys = [ "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX" ]

export const numberToRoman = (num) => {
    
    if (isNaN(num)) return NaN;
    
    let digits = String(+num).split(""), roman = "", idx = 3

    while(idx--)
        roman = (keys[+digits.pop() + (idx * 10)] || "") + roman;
        
    return Array(+digits.join("") + 1).join("M") + roman;
}

export const setSize = (value) => {
    
    let len = 0;
    
    if (typeof value == typeof '') 
        len = value.length > 0 ? value.length : 1
    else 
        len = value.toString().length > 0 ? value.toString().length : 1;
    
    return len.toString();
}

export const sanitizeName = (value) => {

    if(typeof(value) != typeof(""))
        return value

    value = value.trim()
    
    let shrinked = "", space = false
    for(let i = 0; i < value.length; i++) {

        let char = value.charAt(i)
        if(char.match(/[A-Za-z ]/))
            if(char != " ") {
                shrinked += space ? " " + char : char
                space = false
            }   else space = true
    }

    let words = shrinked.trim().split(' ')

    for(let i = 0; i < words.length; i++) {

        if(words[i].length == 1) {
            words[i] = words[i].toUpperCase()
            continue
        }

        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase()
    }

    return words.join(' ')
}

export const isName = (value) => {

    if(typeof(value) != typeof(""))
        return false
    
    return validator.isAlpha(value)
}

export const isEmail = (value) => {

    return validator.isEmail(value)
}

export const isMixedCase = (str) => {

    let upper = /[A-Z]/.test(str), lower = /[a-z]/.test(str)

    return upper && lower
}

export const hasSpecialCharacters = (str) => {

    return /[!@#$%^&*()1234567890]/.test(str)
}

export const measureStrength = (str) => {
    
    let strength = 0
    
    if(str.length >= 8) strength++
    
    if(isMixedCase(str)) strength++
    
    if(hasSpecialCharacters(str)) strength++
    
    return strength
}

export const shrinkObject = (doc, str = "", result = {}) => {
    if(!doc) return ""
    for(let key of Object.keys(doc)) {

        let newKey = str != "" ? str + "_" + key : key

        if(typeof(doc[key]) == typeof({})) {

            shrinkObject(doc[key], newKey, result)

        } else result[newKey] = doc[key]

    }   return result
}

export const jsonToExcel = (data, file = "data") => {

    const json = data.map(doc => shrinkObject(doc))

    const workSheet = XLSX.utils.json_to_sheet(json);
    
    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, workSheet, "data")
    
    XLSX.write(workBook, { bookType: "xlsx", type: "binary" })

    XLSX.writeFile(workBook, file + '.xlsx')
}

export const getTimeString = (sec) => {

    return sec > 60 ? Math.floor(sec / 60) + " min" : sec + " sec"
}