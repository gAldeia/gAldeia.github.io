//Generator.js


function noise(){
    return (Math.random()*0.6) -0.3;
}

function generateLines(){
    let mat = createMatrix(document.getElementById("expressionInput").value, document.getElementById("range").value, document.getElementById("noise").checked, document.getElementById("positiveOnly").checked);

    document.getElementById("expressionOutput").innerHTML = createTable(mat, document.getElementById("expressionInput").value);
}

function createMatrix(expression, range, useNoise, strictlyPositive){
    let nOfVars = 0;

    for(let i=0; i<10; i++){
        if (expression.split("x"+i).length - 1)
            nOfVars++;
    }

    let x = [ ];
    for (i=0; i<range*nOfVars; i++) {
        x.push((strictlyPositive? 0 : -range*nOfVars/2) + i);
    }

    let matrix = [ ];
    for(let i=0; i<range; i++){
        let expressionAux = expression.slice(0);
        let line = [ ];
        for(let j=0; j<nOfVars; j++){
            let index = Math.floor(Math.random()*x.length);
            line.push(x[index]);
            x.splice(index, 1);
            expressionAux = expressionAux.split("x"+j).join(line[j]);
        }
        let result = eval(expressionAux);
        if (useNoise) result += noise();

        line.push(result.toFixed(2));
        matrix.push(line);
    }
    console.log(x.length);
    return matrix;
}

function createTable(matrix, tableName){

    let header = '<tr>';
    for(let i=0; i<matrix[0].length-1; i++)
        header+= '<th>' + ('x' + i) + '</th>';
    header += '<th>f(x)</th><tr>';

    let lines = '';
    for(let i=0; i<matrix.length; i++){
        lines += '<tr>';
        for(let j=0; j<matrix[i].length; j++)
            lines+='<td>' + matrix[i][j] + '</td>';
        lines +='</tr>';
    }

    return '<table align="center" style="width:' + matrix[0].length*75 + 'px">'+header+lines+'<caption class="text-center">'+tableName+'</caption></table>';
}

(function(){
    tableHolder = document.getElementById("tableHolder");
    
    let expressions = ["x0*x0", "Math.sqrt(x0)", "Math.sin(x0)", "x0 + x1*x1", "x0*x1", "Math.sin(x0) + x1*x1"];
    let expressionsNames = ["f(x) = x^2", "f(x) = x^(1/2)", "f(x) = sin(x)", "f(x0, x1) = x0 + x1^2", "f(x0, x1) = x0*x1", "f(x0, x1) = sin(x0) + x1^2"];

    for(let i=0; i<expressions.length; i++){
        let mat = createMatrix(expressions[i], 10, false, (i==1));
        tableHolder.innerHTML += '<div class="col-lg-4"><p>'+createTable(mat, expressionsNames[i])+'</p></div>';
    }
})();