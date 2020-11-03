# xjot: An extensible object type validation tool

##  Overview 

xjot is a type validation library to accelerate the data validation in RESTful APIS.

To use xjot:

  * Define your object template
  * Use the template to validate objects

## Basic use
```javascript
    let contactT = xjot.object {
        firstName : xjot.string( { required: true, maxLength: 18, autoTruncate: true }),
        lastName : xjot.string( { required: true, maxLength: 18, autoTruncate: true }),
        age: xjot.int( required: false, min:1, max: 77 )
    }    

    myObject = { firstName: "John", lastName = "Doe"}

    console.log(JSON.stringify(contactT.validate(myObject),undefined,4 ))
```    

xjot will not only check the field values. It will also perform type convesion and modify the values based on the formatting parameters provided.

## Template reference

### Creating a template

A template is an object that contains describes what rules objects of this kind must follow.
A template is different from a class in that a class describes how to create new instances of an object. 
A template describes the validation rules for the data in that object, as well as some transformations to be applied to the data during validation.


```javascript
  // For simple types
  myfield = xjot.<type>( {rules} )

  // For object 
  myTemplate = xjot.<type>( {fieldsDefinition} [, {rules}] )
```

### Types

xjot currently supports the following types:

* int: integer (value will be truncated) or string that can be converted to a number
* number: any number or string that can be converted to a number
* boolean: any value that can be interpreted as a boolean (true, false, Y, N, 1, 0)
* date: a string that meets the defined criteria,  or string that can be converted to a date
* string: a string that meets the defined criteria
* object: an object composed of any of the xjot types
* array: and array of any of the xjot types

### Template rules
* required: indicates if a field must be present and not undefined (Default false)
* default: when undefined, default value to use
* acceptNull: true if a "null" value is accepted (Default false)
* min, max: boundaries for numbers
* maxLength: maximum length for string values
* autoTruncate: if true, string value will be truncated to maxLength
* values: an list of accepted values in an array
* dbfield: mapped SQL database field for automatic SQL generation (Applies to simple types). 
* autoIncrement: indicates the underlying database field is not writable.
* primaryKey: indicates this field is to be used ar primary key in update SQL.
* table: mapped SQL database table for automatic SQL generation (Applies to object types ).

### Object definitions
The object template definition is an object whose keys are the field name of the objects to check and the values are instances of the field types

**Example**
```javascript
    let addressT = xjot.object({
      line1:   xjot.string( { required: true, maxLength: 80, autoTruncate: true ),
      line2:   xjot.string( { required: false, maxLength: 80, autoTruncate: true ),
      line3:   xjot.string( { required: false, maxLength: 80, autoTruncate: true ),
      zipcode: xjot.string( { required: true, maxLength: 20, autoTruncate: true ),
      city:    xjot.string( { required: true, maxLength: 50, autoTruncate: true ),
      state:   xjot.string( { required: false, maxLength: 30, autoTruncate: true ),
      country: xjot.string( { required: true, maxLength: 30, autoTruncate: true ),
    })

    let contactT = xjot.object ({
        firstName : xjot.string( { required: true, maxLength: 18, autoTruncate: true, dbfield: "first_name" }),
        lastName : xjot.string( { required: true, maxLength: 18, autoTruncate: true }),
        age: xjot.int( required: false, min:1, max: 77 ),
        address: addressT
    }, { table: "contacts" })
```

