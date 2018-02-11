# **Laboratory** Assistant: Lightweight Symbolic Regression

This project was developed to show the possibility of applying the SymTree algorithm as a lightweight alternative to common Symbolic Regression algorithms. This tool can be used as an assistent to physics and engineering experimental labs to verify equations and functions seen in theory classes.

The algorithm was entirely developed in JavaScript.

---

## Getting Started

The project is hosted at http://gAldeia.github.io, where you can use the SymTree algorithm online without any further requirements.

Also, the project page contains a brief tutorial on how to use the tool, some pre made examples to try out the algorithm and a theorical fundamentation of the project (in portuguese);

---

## Installation and Usage

In case you only want the algorithm source code, you'll need to download and include in your HTML two files:

|[LoadFile.js](https://github.com/gAldeia/gAldeia.github.io/blob/master/scripts/LoadFile.js)|[SymbolicRegression.js](https://github.com/gAldeia/gAldeia.github.io/blob/master/scripts/SymbolicRegression.js)|
|---|---|
|The *LoadFile.js* deals with the user input, reading it from a `html <input type=text>` tag or from a `html <input type=file>`, and converting it to an array of DataPoints (an object created to make notation more meanfull)|The *SymbolicRegression.js* contains three algorithms, all based on the new data structure recently introduced by Fabrício Olivetti de França ([GitHub](https://github.com/folivetti)) called *IT - iteraction transformation*.|
  
### Pre requisites

The project depends on the [math.js](http://mathjs.org/) library to handle matrix operations.

### Running

1. Read the user input using one of the methods:
  ```javascript
    manual_upload('input-text-tag-id');
    csv_upload('input-file-tag-id');
    
    //both methods will create a global array of DataPoints
  ```
  
2. Use one of the regression algorithms and store the result in a variable:
  ```javascript
    let eITLS = new IT_LS(150, 1, 3, 50);
    let eITES = new IT_ES(150, 1, 3, 45, 50);
    let eSymTree = new SymTree(3, 0.05, 0, 0);
    
    /*
    those parameters are a good choice if you don't know what they are or what values to use.
    
    Those algorithms can be very slow, but those values were tested during the development,
    and showed good performance while keeping a satisfactory expression pool to explore.
    
    They will return a object called LE - Linear Expression.
    */
   ```
   
3. Now to retrieve informations from the returned LE:
  ```javascript
    eSymTree.printMe(); //returns a string for printing the expression
    eITLS.score; //returns the score of the expression
    eITES.solve(DataPoint); //returns a predicted value for a certain datapoint
  ```
  
---

## License

This project is licensed under the Apache License - see the [LICENSE.md](LICENSE.md) file for details
