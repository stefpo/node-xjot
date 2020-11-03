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
    constructor( rules ) {
        this.rules = rules || {}
        this.isSimpleType = true
        setDefaultRules (this.rules)
    }

    checkType(v) {
        if ( typeof(v) == "string" ) v = parseInt(v)
        if ( v == undefined ) {
            if ( this.rules.required ) throw typeErrorMissing
            else if ( this.rules.default != undefined ) return this.rules.default
            else return undefined
        } else if (isNaN(v)) {
            throw typeErrorInvalidType
        } else if ( v == null ) {
                if ( ! this.rules.acceptNull ) throw typeErrorNullNotAllowed
                else return null            
        } else  if (typeof(v) == "number" ) {
                if (this.rules.max != undefined && v > this.rules.max ) throw typeErrorOutOfRange
                if (this.rules.min != undefined && v < this.rules.min ) throw typeErrorOutOfRange
                return Math.trunc(v,0)
        } 
        else throw typeErrorInvalidType
    }    
}


class NumberT{
    constructor( rules ) {
        this.rules = rules || {}
        this.isSimpleType = true
        setDefaultRules (this.rules)
    }

    checkType(v) {
        if ( typeof(v) == "string" ) v = parseFloat(v)
        if ( v == undefined ) {
            if ( this.rules.required ) throw typeErrorMissing
            else if ( this.rules.default != undefined ) return this.rules.default
            else return undefined
        } else if (isNaN(v)) {
            throw typeErrorInvalidType
        } else if ( v == null ) {
                if ( ! this.rules.acceptNull ) throw typeErrorNullNotAllowed
                else return null   
        } else  if (typeof(v) == "number") {
                if (this.rules.max != undefined && v > this.rules.max ) throw typeErrorOutOfRange
                if (this.rules.min != undefined && v < this.rules.min ) throw typeErrorOutOfRange
                return v
        } 
        else throw typeErrorInvalidType
    }    
}

class BooleanT{
    constructor( rules ) {
        this.rules = rules || {}
        this.isSimpleType = true
        setDefaultRules (this.rules)
    }

    checkType(v) {
        if ( v == undefined ) {
            if ( this.rules.required ) throw typeErrorMissing
            else if ( this.rules.default != undefined ) return this.rules.default
            else return undefined
        }
        else if ( v == null ) {
                if ( ! this.rules.acceptNull ) throw typeErrorNullNotAllowed
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
    constructor( rules ) {
        this.rules = rules || {}
        this.isSimpleType = true
        setDefaultRules (this.rules)
    }

    checkType(v) {
        if ( v == undefined ) {
            if ( this.rules.required ) throw typeErrorMissing
            else if ( this.rules.default != undefined ) return this.rules.default
            else return undefined
        }
        else if ( v == null ) {
                if ( ! this.rules.acceptNull ) throw typeErrorNullNotAllowed
                else return null            
        }
        else if ( v instanceof Date ) {
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
    constructor( rules ) {
        this.rules = rules || {}
        this.isSimpleType = true
        setDefaultRules (this.rules)
    }    
    checkType(v) {
        if ( v == undefined ) {
            if ( this.rules.required ) throw typeErrorMissing
            else if ( this.rules.default != undefined ) return this.rules.default
            else return undefined
        }
        else if ( v == null ) {
                if ( ! this.rules.acceptNull ) throw typeErrorNullNotAllowed
                else return null            
        } else  if (typeof(v) == "string") {
                if (this.rules.values && ! this.rules.values.includes(v) ) throw typeErrorOutOfRange
                if ( this.rules.autoTrimSpaces ) v = v.trim()
                if ( this.rules.maxLength > 0 && this.rules.autoTruncate ) {
                    v = v.substr(0, this.rules.maxLength )
                }
                if ( this.rules.maxLength > 0 && v.length > this.rules.maxLength ) throw typeErrorStringTooLong
                return v
        } 
        else throw typeErrorInvalidType
    }    
}

class ObjectT {
    constructor( def, rules ) {
        this.rules = rules || {}
        this.isSimpleType = false
        this.tmpl = def
        setDefaultRules (this.rules)
    }

    checkType( obj, createMissingProperties ) {
        let validationErrors = null
        let oprops = Object.keys(obj)
        if ( this.rules.required && obj == undefined ) throw typeErrorMissing
        if ( ! obj instanceof Object ) throw typeErrorInvalidType
        for ( let k of Object.keys(this.tmpl)) {
            let v = obj[k]
            let fd = this.tmpl[k]
            if (typeof(fd.checkType) == "function" ) { 
                try {
                    let cr = fd.checkType(v)
                    if (createMissingProperties || oprops.includes(k)) obj[k] = cr
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
        if (typeof(this.rules.validate) == "function" ) {
            let x = this.rules.validate(obj)
            if (x) throw x
        }
            
        return obj
    }

    validate( obj, createMissingProperties ) {
        try {
            let ret = this.checkType(obj, createMissingProperties)
            if (this.rules.validate) return this.rules.validate(this)
            else return null
        } catch (e) {
            return e
        }
    }


    toDbFields(obj) {
        let ret = {}
        for ( let k of Object.keys(this.tmpl)) {
            let v = obj[k]
            let fd = this.tmpl[k].rules
            if (fd == undefined ) 
                console.log("undef")
            let fn = fd.dbField || k          
            ret[fn] = v
        }
        return ret
    }

    insertSQL(o) {
        let dbfields=[]
        let pfields = []
        if ( ! this.rules.table ) throw "Template has no table name defined"
        if ( ! this.validate(o)) {
            for ( let k of Object.keys(this.tmpl)) {
                if (this.tmpl[k].isSimpleType && ! this.tmpl[k].rules.autoIncrement
                    && Object.keys(o).includes(k) && this.tmpl[k].rules.dbfield !== null) {
                    dbfields.push(this.tmpl[k].rules.dbfield || k)
                    pfields.push("@"+k)
                }
            }        
            return `insert into ${this.rules.table} (${dbfields.join(", ")}) values (${pfields.join(", ")})`
        } else {
            return null
        }
    }

    updateSQL(o) {
        let updFields = []
        let where = null
        if ( ! this.rules.table ) throw "Template has no table name defined"
        if ( ! this.validate(o)) {
            for ( let k of Object.keys(this.tmpl)) {
                if (this.tmpl[k].rules.primaryKey ) {
                    where = this.tmpl[k].rules.dbfield || k + " = @" +k
                } else if (this.tmpl[k].isSimpleType && ! this.tmpl[k].rules.autoIncrement
                    && Object.keys(o).includes(k)  && this.tmpl[k].rules.dbfield !== null ) {
                        updFields.push(this.tmpl[k].rules.dbfield || k + " = @" +k)
                }
            } 
            if ( where == null ) throw "Template has no primary key defined"
            if ( updFields.length > 0 )
                return `update ${this.rules.table} set (${updFields.join(", ")}) where ${where}`

        } 
        return null
    }    
}

class ArrayT{
    constructor( def, rules ) {
        this.rules = rules || {}
        this.isSimpleType = false
        if ( ! def instanceof Object ) throw Object.getPrototypeOf(this).constructor.name + ": Invalid type definition"
        if (def.checkType && typeof(def.checkType) == "function") {
            this.tmpl = def
        } else {
            this.tmpl = typeObject(def)
        }
        setDefaultRules (this.rules)
    }    

    checkType( obj ) {
        let validationErrors = null
        if ( this.rules.required && obj == undefined ) throw typeErrorMissing
        if (! Array.isArray(obj)) throw typeErrorInvalidType
        if ( this.rules.minLength && obj.length < this.rules.minLength ) throw typeErrorArrayTooSmall
        if ( this.rules.maxLength && obj.length > this.rules.maxLength ) throw typeErrorArrayTooLarge
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

function typeObject( def, rules ) {
    return new ObjectT(def, rules)
}

function typeArray( def, rules ) {
    return new ArrayT(def, rules)
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