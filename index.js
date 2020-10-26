/*!
 * $modulename
 * Copyright(c) 2019 Stephane Potelle 
 * MIT Licensed
*/


const typeErrorInvalidType = "Invalid type"
const typeErrorMissing = "Missing required field"
const typeErrorNullNotAllowed = "Null value not allowed"
const typeErrorOutOfRange = "Value out of range"
const typeErrorStringTooLong = "String size exceeds max length"
const typeErrorInvalidDefinition = "Invalid type definition"
const typeErrorInvalidDateFormat = "Invalid date format"

function setDefaultRules ( rules ) {
    let ar = rules || {}
    ar.required = ar.required || false
    ar.acceptNull = ar.acceptNull == undefined ? false : ar.acceptNull
    ar.min = ar.min || undefined
    ar.max = ar.max || undefined
    return ar
}

function typeInt( rules ) {
    let ar = setDefaultRules( rules )
    ar.defaut = ar.default || 0

    return {
        attr: ar,
        chkfn: function(v) {
                if ( v == undefined ) {
                    if ( ar.required ) throw typeErrorMissing
                    else if ( ar.default != undefined ) return ar.default
                    else return undefined
                }
                else if ( v == null ) {
                        if ( ! ar.acceptNull ) throw typeErrorNullNotAllowed
                        else return null            
                } else  if (typeof(v) == "number") {
                        if (ar.max != undefined && v > ar.max ) throw typeErrorOutOfRange
                        if (ar.min != undefined && v < ar.min ) throw typeErrorOutOfRange
                        return Math.trunc(v,0)
                } 
                else throw typeErrorInvalidType
        }
    }
}

function typeNumber( rules ) {
    let ar = setDefaultRules( rules )
    ar.defaut = ar.default || 0

    return {
        attr: ar,
        chkfn: function(v) {
            if ( v == undefined ) {
                if ( ar.required ) throw typeErrorMissing
                else if ( ar.default != undefined ) return ar.default
                else return undefined
            }
            else if ( v == null ) {
                    if ( ! ar.acceptNull ) throw typeErrorNullNotAllowed
                    else return null            
            } else  if (typeof(v) == "number") {
                    if (ar.max != undefined && v > ar.max ) throw typeErrorOutOfRange
                    if (ar.min != undefined && v < ar.min ) throw typeErrorOutOfRange
                    return v
            } 
            else throw typeErrorInvalidType
        }
    }
}

function typeBoolean( rules ) {
    let ar = setDefaultRules( rules )
    ar.defaut = ar.default || false

    return {
        attr: ar,
        chkfn: function(v) {
            if ( v == undefined ) {
                if ( ar.required ) throw typeErrorMissing
                else if ( ar.default != undefined ) return ar.default
                else return undefined
            }
            else if ( v == null ) {
                    if ( ! ar.acceptNull ) throw typeErrorNullNotAllowed
                    else return null            
            }
            else if (v == "Y" || v == "y" || v == "1") {
                return true
            } 
            else if (v == "N" || v == "n" || v == "0") {
                return false
            } 
            else if (typeof(v) == "boolean") {
                    return v
            } 
            else throw typeErrorInvalidType
        }
    }
}

function typeDate( rules ) {
    let ar = setDefaultRules( rules )
    ar.defaut = ar.default || new Date(Date.now())

    return {
        attr: ar,
            chkfn: function(v) {
            if ( v == undefined ) {
                if ( ar.required ) throw typeErrorMissing
                else if ( ar.default != undefined ) return ar.default
                else return undefined
            }
            else if ( v == null ) {
                    if ( ! ar.acceptNull ) throw typeErrorNullNotAllowed
                    else return null            
            }
            else if ( typeof(v.getTime) == "function") {
                return v
            }
            else if ( typeof(v) == "string") {
                let d = Date.parse(v) 
                if ( isNaN(d)  ) throw typeErrorInvalidDateFormat
                else return new Date(d)
            } 
            else throw typeErrorInvalidType
        }
    }
}

function typeString( rules ) {
    let ar = setDefaultRules( rules )
    ar.defaut = ar.default || ""
    ar.values = ar.values || null
    ar.maxLength = ar.maxLength || -1
    ar.autoTruncate = ar.autoTruncate == undefined ? true : ar.autoTruncate 
    ar.autoTrimSpaces = ar.autoTrimSpaces || false

    return {
        attr: ar,
        chkfn: function(v) {
            if ( v == undefined ) {
                if ( ar.required ) throw typeErrorMissing
                else if ( ar.default != undefined ) return ar.default
                else return undefined
            }
            else if ( v == null ) {
                    if ( ! ar.acceptNull ) throw typeErrorNullNotAllowed
                    else return null            
            } else  if (typeof(v) == "string") {
                    if (ar.values && ! ar.values.includes(v) ) throw typeErrorOutOfRange
                    if ( ar.autoTrimSpaces ) v = v.trim()
                    if ( ar.maxLength > 0 && ar.autoTruncate ) {
                        v = v.substr(0, ar.maxLength )
                    }
                    if ( ar.maxLength > 0 && v.length > ar.maxLength ) throw typeErrorStringTooLong
                    return v
            } 
            else throw typeErrorInvalidType
        }
    }
}

class Template {
    constructor( def ) {
        this.tmpl = def
    }

    checkType( obj ) {
        let validationErrors = null
        for ( let k of Object.keys(this.tmpl)) {
            let v = obj[k]
            let fd = this.tmpl[k]
            if (typeof(fd.chkfn) == "function" ) { 
                try {
                    let cr = fd.chkfn(v)
                    obj[k] = cr
                } catch (e) {
                    if (validationErrors == null) validationErrors={}
                    validationErrors[k] = e
                }
            } else {
                if (validationErrors == null) validationErrors={}
                validationErrors[k] = typeErrorInvalidDefinition
            }
        }
        return validationErrors
    }

    toDbFields(obj) {
        let ret = {}
        for ( let k of Object.keys(this.tmpl)) {
            let v = obj[k]
            let fd = this.tmpl[k].attr
            let fn = fd.dbField || k          
            ret[fn] = v
        }
        return ret
    }
}

function T( def ) {
    return new Template(def)
}

module.exports.int = typeInt
module.exports.number = typeNumber
module.exports.boolean = typeBoolean
module.exports.string = typeString
module.exports.date = typeDate
module.exports.Template = Template
module.exports.T = T

module.exports.typeErrorInvalidType = typeErrorInvalidType
module.exports.typeErrorMissing = typeErrorMissing
module.exports.typeErrorNullNotAllowed = typeErrorNullNotAllowed
module.exports.typeErrorOutOfRange = typeErrorOutOfRange
module.exports.typeErrorStringTooLong = typeErrorStringTooLong
module.exports.typeErrorInvalidDefinition = typeErrorInvalidDefinition
module.exports.typeErrorInvalidDateFormat = typeErrorInvalidDateFormat