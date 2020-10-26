/*!
 * $modulename
 * Copyright(c) 2019 Stephane Potelle 
 * MIT Licensed
*/

xjot = require ("./index")

template = xjot.T({
    intField:   xjot.int({ required: true, dbField: "int_field" }),
    required:   xjot.int({ required: true, altName: "req"}),
    default:    xjot.int({ default: 17}),
    rangeIn:    xjot.int({ required: true, min: 0, max: 8}),
    rangeOut:   xjot.int({ required: true, min: 0, max: 8}),
    bool:       xjot.boolean({ required: true }),
    str1:       xjot.string( {required: true, values: ["Active","Deleted"] }),
    str2:       xjot.string( {required: true, values: ["Active","Deleted"] }),
    longstr:    xjot.string( {required: true, maxLength: 8, autoTruncate: true, altName: "req" }), 
    dateStr:    xjot.date(),
    dateStrErr: xjot.date() 
})

obj = {
    intField: 12.5,
    required: undefined,
    default: undefined,
    rangeIn: 3,
    rangeOut: 9, 
    bool: true,
    bool2: null,
    str1: "Active",
    str2: "toto",
    longstr: "This is a test",
    dateStr: "2020-10-25",
    dateStrErr: "Not a date" 
}

//console.log(JSON.stringify(validateObject(obj,template),undefined,4 ))
console.log(JSON.stringify(template.checkType(obj),undefined,4 ))
console.log(JSON.stringify(obj,undefined,4))
console.log(JSON.stringify(template.toDbFields(obj),undefined,4))