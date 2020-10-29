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
const typeErrorArrayTooSmall = "Array too small"
const typeErrorArrayTooLarge = "Array too large"


function setDefaultRules ( rules ) {
    let ar = rules || {}
    ar.required = ar.required || false
    ar.acceptNull = ar.acceptNull == undefined ? false : ar.acceptNull
    ar.min = ar.min || undefined
    ar.max = ar.max || undefined
    return ar
}

class IntT{
    constructor( attr ) {
        this.attr = attr || {}
        setDefaultRules (this.attr)
    }

    checkType(v) {
        if ( typeof(v) == "string" ) v = parseInt(v)
        if ( v == undefined ) {
            if ( this.attr.required ) throw typeErrorMissing
            else if ( this.attr.default != undefined ) return this.attr.default
            else return undefined
        } else if (isNaN(v)) {
            throw typeErrorInvalidType
        } else if ( v == null ) {
                if ( ! this.attr.acceptNull ) throw typeErrorNullNotAllowed
                else return null            
        } else  if (typeof(v) == "number" ) {
                if (this.attr.max != undefined && v > this.attr.max ) throw typeErrorOutOfRange
                if (this.attr.min != undefined && v < this.attr.min ) throw typeErrorOutOfRange
                return Math.trunc(v,0)
        } 
        else throw typeErrorInvalidType
    }    
}


class NumberT{
    constructor( attr ) {
        this.attr = attr || {}
        setDefaultRules (this.attr)
    }

    checkType(v) {
        if ( typeof(v) == "string" ) v = parseInt(v)
        if ( v == undefined ) {
            if ( this.attr.required ) throw typeErrorMissing
            else if ( this.attr.default != undefined ) return this.attr.default
            else return undefined
        } else if (isNaN(v)) {
            throw typeErrorInvalidType
        } else if ( v == null ) {
                if ( ! this.attr.acceptNull ) throw typeErrorNullNotAllowed
                else return null   
        } else  if (typeof(v) == "number") {
                if (this.attr.max != undefined && v > this.attr.max ) throw typeErrorOutOfRange
                if (this.attr.min != undefined && v < this.attr.min ) throw typeErrorOutOfRange
                return v
        } 
        else throw typeErrorInvalidType
    }    
}

class BooleanT{
    constructor( attr ) {
        this.attr = attr || {}
        setDefaultRules (this.attr)
    }

    checkType(v) {
        if ( v == undefined ) {
            if ( this.attr.required ) throw typeErrorMissing
            else if ( this.attr.default != undefined ) return this.attr.default
            else return undefined
        }
        else if ( v == null ) {
                if ( ! this.attr.acceptNull ) throw typeErrorNullNotAllowed
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

class DateT{
    constructor( attr ) {
        this.attr = attr || {}
        setDefaultRules (this.attr)
    }

    checkType(v) {
        if ( v == undefined ) {
            if ( this.attr.required ) throw typeErrorMissing
            else if ( this.attr.default != undefined ) return this.attr.default
            else return undefined
        }
        else if ( v == null ) {
                if ( ! this.attr.acceptNull ) throw typeErrorNullNotAllowed
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

class StringT{
    constructor( attr ) {
        this.attr = attr || {}
        setDefaultRules (this.attr)
    }    
    checkType(v) {
        if ( v == undefined ) {
            if ( this.attr.required ) throw typeErrorMissing
            else if ( this.attr.default != undefined ) return this.attr.default
            else return undefined
        }
        else if ( v == null ) {
                if ( ! this.attr.acceptNull ) throw typeErrorNullNotAllowed
                else return null            
        } else  if (typeof(v) == "string") {
                if (this.attr.values && ! this.attr.values.includes(v) ) throw typeErrorOutOfRange
                if ( this.attr.autoTrimSpaces ) v = v.trim()
                if ( this.attr.maxLength > 0 && this.attr.autoTruncate ) {
                    v = v.substr(0, this.attr.maxLength )
                }
                if ( this.attr.maxLength > 0 && v.length > this.attr.maxLength ) throw typeErrorStringTooLong
                return v
        } 
        else throw typeErrorInvalidType
    }    
}

class ObjectT {
    constructor( def, attr ) {
        this.tmpl = def
        this.attr = attr || {}
        setDefaultRules (this.attr)
    }

    checkType( obj ) {
        let validationErrors = null
        if ( this.attr.required && obj == undefined ) throw typeErrorMissing
        if (typeof(obj) != "object") throw typeErrorInvalidType
        for ( let k of Object.keys(this.tmpl)) {
            let v = obj[k]
            let fd = this.tmpl[k]
            if (typeof(fd.checkType) == "function" ) { 
                try {
                    let cr = fd.checkType(v)
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
        if ( validationErrors ) throw validationErrors
        if (typeof(this.attr.validate) == "function" ) {
            let x = this.attr.validate(obj)
            if (x) throw x
        }
            
        return obj
    }

    validate( obj ) {
        try {
            let ret = this.checkType(obj)
            return null
        } catch (e) {
            return e
        }
    }


    toDbFields(obj) {
        let ret = {}
        for ( let k of Object.keys(this.tmpl)) {
            let v = obj[k]
            let fd = this.tmpl[k].attr
            if (fd == undefined ) 
                console.log("undef")
            let fn = fd.dbField || k          
            ret[fn] = v
        }
        return ret
    }
}

class ArrayT{
    constructor( def, attr ) {
        if (typeof(def) != 'object') throw Object.getPrototypeOf(this).constructor.name + ": Invalid type definition"
        if (def.checkType && typeof(def.checkType) == "function") {
            this.tmpl = def
        } else {
            this.tmpl = typeObject(def)
        }
        this.attr = attr || {}
        setDefaultRules (this.attr)
    }    

    checkType( obj ) {
        let validationErrors = null
        if ( this.attr.required && obj == undefined ) throw typeErrorMissing
        if (! Array.isArray(obj)) throw typeErrorInvalidType
        if ( this.attr.minLength && obj.length < this.attr.minLength ) throw typeErrorArrayTooSmall
        if ( this.attr.maxLength && obj.length > this.attr.maxLength ) throw typeErrorArrayTooLarge
        for (let i in obj) {
            try {
                let x = this.tmpl.checkType(obj[i])
            }catch (e) {
                if (validationErrors == null) validationErrors={}
                validationErrors[i] = e
            }
        }

        if ( validationErrors ) throw validationErrors
            
        return obj
    }    

    validate( obj ) {
        try {
            let ret = this.checkType(obj)
            return null
        } catch (e) {
            return e
        }
    }    
}


function typeInt( rules ) {
    return new IntT(rules)
}

function typeNumber( rules ) {
    return new NumberT(rules)
}

function typeBoolean( rules ) {
    return new BooleanT(rules)
}

function typeDate( rules ) {
    return new DateT(rules)
}

function typeString( rules ) {
    return new StringT(rules)
}

function typeObject( def, attr ) {
    return new ObjectT(def, attr)
}

function typeArray( def, attr ) {
    return new ArrayT(def, attr)
}

module.exports.int = typeInt
module.exports.number = typeNumber
module.exports.boolean = typeBoolean
module.exports.string = typeString
module.exports.date = typeDate
module.exports.object = typeObject
module.exports.array = typeArray

module.exports.typeErrorInvalidType = typeErrorInvalidType
module.exports.typeErrorMissing = typeErrorMissing
module.exports.typeErrorNullNotAllowed = typeErrorNullNotAllowed
module.exports.typeErrorOutOfRange = typeErrorOutOfRange
module.exports.typeErrorStringTooLong = typeErrorStringTooLong
module.exports.typeErrorInvalidDefinition = typeErrorInvalidDefinition
module.exports.typeErrorInvalidDateFormat = typeErrorInvalidDateFormat