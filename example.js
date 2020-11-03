/*!
 * $modulename
 * Copyright(c) 2019 Stephane Potelle 
 * MIT Licensed
*/

xjot = require ("./index")

arrayObject = xjot.object({
        f1: xjot.int(),
        f2: xjot.string() } )



template = xjot.object({
    intField:   xjot.int({ required: true, dbField: "int_field" }),
    numField:   xjot.number(),
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
    dateDate:   xjot.date(),
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
                            { required: true, minLength: 4 } ),  
    arr2:        xjot.array( arrayObject, { required: false } ), 
    arr3: xjot.array( xjot.int() )             
})


obj = {
    intField: 12.5,
    numField: "18.36E3",
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
    dateDate: new Date(Date.now()),
    obj: {
        f1: "23", f2: "A string"
    },
    obj3: "titi",
    arr1: [ {f1:1, f2: "zaza"}, {f1:"fail", f2: "zozo"} ],
    arr2: [ {f1:1, f2: "zaza"}, {f1:"fail", f2: "zozo"} ],
    arr3: [ 1,2,3,4,5, "this one fails" ]  
}

contactRecord = xjot.object( {
    id: xjot.int( { autoIncrement: true, primaryKey: true }),
    firstName : xjot.string(),
    lastName : xjot.string(),
    birthDate: xjot.date(),
    age: xjot.int(),
    email: xjot.string( { default: "" } ),
    altEmail: xjot.string()
    }, { table: "contact"}
)

aPerson = {
    id: "23",
    firstName : "John",
    lastName : "Doe",
    birthDate: "1997-11-18",
    age: 23
}

//console.log(JSON.stringify(validateObject(obj,template),undefined,4 ))
console.log(JSON.stringify(template.validate(obj),undefined,4 ))
console.log(JSON.stringify(obj,undefined,4))

console.log(contactRecord.insertSQL(aPerson) )
console.log(contactRecord.updateSQL(aPerson) )

//console.log(JSON.stringify(template.toDbFields(obj),undefined,4))