# **Laboratory** Assistant: Lightweight Symbolic Regression

This webpage was developed to show the possibility of applying the SymTree algorithm as a lightweight alternative to common Symbolic Regression algorithms. This tool can be used as an assistent to physics and engineering experimental labs to verify equations and functions seen in theory classes.

The algorithm was entirely developed in JavaScript.

---

## Getting Started

The project is hosted at http://gAldeia.github.io, where you can use the SymTree algorithm without any further requirements.

Also, the project page contains:
* A brief tutorial on how to use the tool;
* Some pre made examples to try out the algorithm;
* The theorical fundamentation of the project (in portuguese);

### Source code

In case you only want the algorithm source code, you'll need to download and include in your HTML two files:
* [LoadFile.js](https://github.com/gAldeia/gAldeia.github.io/blob/master/scripts/LoadFile.js), and
* [SymbolicRegression.js](https://github.com/gAldeia/gAldeia.github.io/blob/master/scripts/SymbolicRegression.js). 

The *LoadFile.js* deals with the user input, reading it from a ```html <input type=text>``` tag or from a ```html <input type=file>```, and converting it to an array of DataPoints (an object created to make notation more intuitive and meanfull).
  
The *SymbolicRegression.js* contains three algorithms, all based on the new data structure recently introduced by Fabrício Olivetti de França ([GitHub](https://github.com/folivetti)) called *IT - interaction transformation*.
  
#### Pre requisites

The project depends on the [math.js](http://mathjs.org/) library to handle matrix operations.

#### Running

1. Read the user input using one of the methods:
  ```javascript
    manual_upload('input-text-tag-id');
    csv_upload('input-file-tag-id');
  ```
  (Note: those methods will create an global array of DataPoints)
  
2. Call one of the regression algorithms and store the result in a variable:
  ```javascript
    let eITLS = new IT_LS(150, 1, 3, 50);
    let eITES = new IT_ES(150, 1, 3, 45, 50);
    let eSymTree = new SymTree(5, 0.05, 0, 0);
   ```
   
   (Note: those parameters used in the example are a good choice, since those algorithms can be very slow)
   
## License

This project is licensed under the Apache License - see the [LICENSE.md](LICENSE.md) file for details
