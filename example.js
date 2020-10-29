/*!
 * $modulename
 * Copyright(c) 2019 Stephane Potelle 
 * MIT Licensed
*/

xjot = require ("./index")

template = xjot.object({
    intField:   xjot.int({ required: true, dbField: "int_field" }),
    required:   xjot.int({ required: true, altName: "req"}),
    default:    xjot.int({ default: 17}),
    rangeIn:    xjot.number({ required: true, min: 0, max: 8}),
    rangeOut:   xjot.number({ required: true, min: 0, max: 8}),
    bool:       xjot.boolean({ required: true }),
    str1:       xjot.string( {required: true, values: ["Active","Deleted"] }),
    str2:       xjot.string( {required: true, values: ["Active","Deleted"] }),
    longstr:    xjot.string( {required: true, maxLength: 8, autoTruncate: true }), 
    dateStr:    xjot.date(),
    dateStrErr: xjot.date(),
    obj:        xjot.object({
                    f1: xjot.int(),
                    f2: xjot.string() }, 
                    { required: true, validate: function(v){ if (v.f1 < 40) return "f2 is too small" }   }),  
    obj2:        xjot.object({
                    x1: xjot.int(),
                    x2: xjot.string() },
                    { required: true } ),  
    obj3:        xjot.object({
                    x1: xjot.int(),
                    x2: xjot.string() }, 
                    { required: true } ),  
    arr1:        xjot.array( xjot.object({
        f1: xjot.int(),
        f2: xjot.string()}),
        { required: true } ),  
    arr2:        xjot.array( {
        f1: xjot.int(),
        f2: xjot.string()},
        { required: false } ), 
    arr3: xjot.array( xjot.int() )             
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
    dateStrErr: "Not a date",
    obj: {
        f1: "23", f2: "A string"
    },
    obj3: "titi",
    arr1: [ {f1:1, f2: "zaza"}, {f1:"fail", f2: "zozo"} ],
    arr2: [ {f1:1, f2: "zaza"}, {f1:"fail", f2: "zozo"} ],
    arr3: [ 1,2,3,4,5, "this one fails" ]  
}



//console.log(JSON.stringify(validateObject(obj,template),undefined,4 ))
console.log(JSON.stringify(template.validate(obj),undefined,4 ))
console.log(JSON.stringify(obj,undefined,4))
//console.log(JSON.stringify(template.toDbFields(obj),undefined,4))