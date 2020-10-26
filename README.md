# xjot: An extensible object type validation tool

##  Overview 

xjot is a type validation library to accelerate the data validation in RESTful APIS.

To use xjot:

  * Define your object template
  * Use the template to validate objects

## Basic use

    let contactT = xjot.Template {
        firstName : xjot.string( { required: true, maxLength: 18, autoTruncate: true }),
        lastName : xjot.string( { required: true, maxLength: 18, autoTruncate: true }),
        age: xjot.int( required: false, min:1, max: 77 )
    }    

    myObject = { firstName: "John", lastName = "Doe"}

    console.log(JSON.stringify(contactT.checkType(myObject),undefined,4 ))

xjot will not only check the field values. It will also modify the values based on the formatting parametes provided.

## Template reference

### Types

xjot currently supports the following types:

* int: integer (value will be truncated)
* number: any number
* boolean: any value that can be interpreted as a boolean (true, false, Y, N, 1, 0)
* string: a string that meets the defined criteria

### Template parameters

* required: indicates if a field must be present and not undefined (Default false)
* default: when undefined, default value to use
* acceptNull: true if a "null" value is accepted (Default false)
* min, max: boundaries for numbers
* maxLength: maximum length for string values
* autoTruncate: if true, string value will be truncated to maxLength
* values: an list of accepted values in an array